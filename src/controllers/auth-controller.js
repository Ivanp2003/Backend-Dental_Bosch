import Doctor from "../models/Doctor.js";
import Paciente from "../models/Paciente.js";
import bcrypt from "bcryptjs";
import crearJWT from "../helpers/crearJWT.js";

// Crear nuevo doctor (solo para doctores autenticados)
export const crearDoctor = async (req, res) => {
    try {
        const { nombre, apellido, email, password, especialidad, telefono, direccion } = req.body;

        // Validar campos obligatorios
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ msg: "Nombre, apellido, email y contraseña son obligatorios" });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
        }

        // Verificar si el doctor ya existe
        const doctorExistente = await Doctor.findOne({ email });
        if (doctorExistente) {
            return res.status(400).json({ msg: "El email ya está registrado como doctor" });
        }

        // Verificar si el email existe como paciente
        const pacienteExistente = await Paciente.findOne({ emailPaciente: email });
        if (pacienteExistente) {
            return res.status(400).json({ msg: "El email ya está registrado como paciente" });
        }

        // Crear nuevo doctor
        const doctor = new Doctor({
            nombre,
            apellido,
            email,
            password,
            especialidad,
            telefono,
            direccion,
            confirmado: true, // Los doctores creados por otros doctores se confirman automáticamente
            estado: "aprobado" // Los doctores creados por doctores aprobados se aprueban automáticamente
        });

        await doctor.save();

        res.status(201).json({
            msg: "Doctor creado exitosamente",
            doctor: {
                id: doctor._id,
                nombre: doctor.nombre,
                apellido: doctor.apellido,
                email: doctor.email,
                especialidad: doctor.especialidad,
                rol: doctor.rol,
                estado: doctor.estado
            }
        });
    } catch (error) {
        console.error("Error al crear doctor:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Listar doctores pendientes de aprobación (solo doctores aprobados)
export const listarDoctoresPendientes = async (req, res) => {
    try {
        const doctoresPendientes = await Doctor.find({ 
            estado: "pendiente",
            confirmado: true 
        })
        .select("-password -token -__v")
        .sort({ createdAt: -1 });

        res.json({
            msg: "Doctores pendientes de aprobación",
            doctores: doctoresPendientes
        });
    } catch (error) {
        console.error("Error al listar doctores pendientes:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Aprobar doctor (solo doctores aprobados)
export const aprobarDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Validar ID
        if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: "ID de doctor inválido" });
        }

        // Buscar doctor
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ msg: "Doctor no encontrado" });
        }

        // Verificar que esté pendiente
        if (doctor.estado !== "pendiente") {
            return res.status(400).json({ msg: `El doctor ya está ${doctor.estado}` });
        }

        // Aprobar doctor
        doctor.estado = "aprobado";
        await doctor.save();

        res.json({
            msg: "Doctor aprobado exitosamente",
            doctor: {
                id: doctor._id,
                nombre: doctor.nombre,
                apellido: doctor.apellido,
                email: doctor.email,
                especialidad: doctor.especialidad,
                estado: doctor.estado
            }
        });
    } catch (error) {
        console.error("Error al aprobar doctor:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Rechazar doctor (solo doctores aprobados)
export const rechazarDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Validar ID
        if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: "ID de doctor inválido" });
        }

        // Buscar doctor
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ msg: "Doctor no encontrado" });
        }

        // Verificar que esté pendiente
        if (doctor.estado !== "pendiente") {
            return res.status(400).json({ msg: `El doctor ya está ${doctor.estado}` });
        }

        // Rechazar doctor
        doctor.estado = "rechazado";
        await doctor.save();

        res.json({
            msg: "Doctor rechazado",
            doctor: {
                id: doctor._id,
                nombre: doctor.nombre,
                apellido: doctor.apellido,
                email: doctor.email,
                estado: doctor.estado
            }
        });
    } catch (error) {
        console.error("Error al rechazar doctor:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Promover paciente a doctor (solo para doctores autenticados)
export const promoverPacienteADoctor = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { especialidad, telefono, direccion } = req.body;

        // Validar que el paciente ID sea válido
        if (!pacienteId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: "ID de paciente inválido" });
        }

        // Buscar paciente
        const paciente = await Paciente.findById(pacienteId);
        if (!paciente) {
            return res.status(404).json({ msg: "Paciente no encontrado" });
        }

        // Verificar que el paciente no sea ya doctor
        if (paciente.rol === "doctor") {
            return res.status(400).json({ msg: "El paciente ya tiene rol de doctor" });
        }

        // Verificar si el email ya existe como doctor
        const doctorExistente = await Doctor.findOne({ email: paciente.emailPaciente });
        if (doctorExistente) {
            return res.status(400).json({ msg: "Ya existe un doctor con este email" });
        }

        // Crear nuevo doctor a partir de datos del paciente
        const nuevoDoctor = new Doctor({
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            email: paciente.emailPaciente,
            password: paciente.passwordPaciente, // Se mantiene la misma contraseña
            especialidad,
            telefono: telefono || paciente.telefono,
            direccion: direccion || paciente.direccion,
            confirmado: true
        });

        await nuevoDoctor.save();

        // Eliminar paciente original o marcar como promovido
        await Paciente.findByIdAndDelete(pacienteId);

        res.status(200).json({
            msg: "Paciente promovido a doctor exitosamente",
            doctor: {
                id: nuevoDoctor._id,
                nombre: nuevoDoctor.nombre,
                apellido: nuevoDoctor.apellido,
                email: nuevoDoctor.email,
                especialidad: nuevoDoctor.especialidad,
                rol: nuevoDoctor.rol
            }
        });
    } catch (error) {
        console.error("Error al promover paciente a doctor:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};
