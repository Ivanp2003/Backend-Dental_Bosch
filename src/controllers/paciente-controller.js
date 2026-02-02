import Paciente from "../models/Paciente.js";
import bcrypt from "bcryptjs";
import crearJWT from "../helpers/crearJWT.js";
import { sendMailToRegister } from "../helpers/sendMail.js";
import crypto from "crypto";

// LISTAR PACIENTES (solo doctores)
const listarPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find()
      .select("-passwordPaciente -__v")
      .sort({ createdAt: -1 });

    res.json(pacientes);
  } catch (error) {
    console.error("Error al listar pacientes:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// REGISTRO PACIENTE (PÚBLICO)
const registrarPaciente = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      cedula,
      emailPaciente,
      password,
      telefono,
      fechaNacimiento,
      genero
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !cedula ||
      !emailPaciente ||
      !password ||
      !telefono ||
      !fechaNacimiento ||
      !genero
    ) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existeEmail = await Paciente.findOne({ emailPaciente });
    if (existeEmail) {
      return res.status(400).json({ msg: "El email ya está registrado" });
    }

    const existeCedula = await Paciente.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({ msg: "La cédula ya está registrada" });
    }

    const paciente = new Paciente({
      nombre,
      apellido,
      cedula,
      emailPaciente,
      passwordPaciente: password,
      telefono,
      fechaNacimiento: new Date(fechaNacimiento),
      genero,
      token: crypto.randomBytes(20).toString("hex"),
      confirmado: false,
      provider: "local"
    });

    await paciente.save();

    // Enviar correo de confirmación (no bloquear el registro si falla)
    try {
      await sendMailToRegister(emailPaciente, nombre, paciente.token);
    } catch (emailError) {
      console.error("Error al enviar correo de confirmación:", emailError.message);
    }

    res.status(201).json({
      msg: "Registro exitoso. Por favor, revisa tu correo para confirmar tu cuenta"
    });
  } catch (error) {
    console.error("Error al registrar paciente:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};


// LOGIN PACIENTE
const loginPaciente = async (req, res) => {
  try {
    const { email, password } = req.body;

    const paciente = await Paciente.findOne({ emailPaciente: email });
    if (!paciente) {
      return res.status(404).json({ msg: "Paciente no registrado" });
    }

    if (!paciente.estadoPaciente) {
      return res.status(403).json({ msg: "Cuenta desactivada" });
    }

    if (!paciente.confirmado) {
      return res.status(403).json({ msg: "La cuenta no ha sido confirmada. Por favor, revisa tu correo" });
    }

    const passwordValido = await paciente.matchPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const token = crearJWT(paciente._id, "paciente");

    res.status(200).json({
      token,
      paciente: {
        id: paciente._id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        email: paciente.emailPaciente,
        rol: paciente.rol
      }
    });
  } catch (error) {
    console.error("❌ Error completo al registrar paciente:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// CONFIRMAR EMAIL PACIENTE
const confirmarMailPaciente = async (req, res) => {
  try {
    const { token } = req.params;

    const paciente = await Paciente.findOne({ token });
    if (!paciente) return res.status(400).json({ msg: "Token no válido" });

    await Paciente.updateOne(
      { _id: paciente._id },
      { confirmado: true, token: "" }
    );

    res.json({ 
      msg: "Cuenta confirmada correctamente. Ya puedes iniciar sesión" 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error al confirmar la cuenta" });
  }
};

// PERFIL PACIENTE
const perfilPaciente = (req, res) => {
  const { passwordPaciente, __v, ...perfil } = req.pacienteHeader._doc;
  res.json(perfil);
};

// ACTUALIZAR PERFIL PACIENTE
const actualizarPerfilPaciente = async (req, res) => {
  try {
    console.log("📥 Datos recibidos para actualizar perfil paciente:", req.body);
    console.log("👤 ID del paciente desde token:", req.pacienteHeader._id);
    
    const paciente = await Paciente.findById(req.pacienteHeader._id);
    
    if (!paciente) {
      console.log("❌ Paciente no encontrado");
      return res.status(404).json({ msg: "Paciente no encontrado" });
    }

    console.log("✅ Paciente encontrado:", paciente.nombre, paciente.apellido);
    console.log("📝 Actualizando campos...");

    paciente.nombre = req.body.nombre ?? paciente.nombre;
    paciente.apellido = req.body.apellido ?? paciente.apellido;
    paciente.telefono = req.body.telefono ?? paciente.telefono;
    paciente.direccion = req.body.direccion ?? paciente.direccion;

    console.log("💾 Guardando cambios...");
    await paciente.save();
    console.log("✅ Paciente actualizado exitosamente");

    res.json({ msg: "Perfil actualizado" });
  } catch (error) {
    console.error("❌ Error completo al registrar paciente:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const crearPacienteDoctor = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      cedula,
      emailPaciente,
      telefono,
      direccion,
      fechaNacimiento,
      genero
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !cedula ||
      !emailPaciente ||
      !telefono ||
      !fechaNacimiento ||
      !genero
    ) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const existeEmail = await Paciente.findOne({ emailPaciente });
    if (existeEmail) {
      return res.status(400).json({ msg: "El email ya está registrado" });
    }

    const existeCedula = await Paciente.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({ msg: "La cédula ya está registrada" });
    }

    const paciente = new Paciente({
      nombre,
      apellido,
      cedula,
      emailPaciente,
      telefono,
      direccion,
      fechaNacimiento,
      genero,
      doctor: req.doctorHeader._id,
      passwordPaciente: "TEMPORAL123" // no se usará
    });

    await paciente.save();

    res.status(201).json({
      msg: "Paciente creado correctamente",
      paciente
    });
  } catch (error) {
    console.error("❌ Error crearPacienteDoctor:", error);
    res.status(500).json({ msg: "Error al crear paciente" });
  }
};

// DESACTIVAR PACIENTE (cambiar estado a inactivo)
const desactivarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({ msg: "Paciente no encontrado" });
    }

    // Cambiar estado a inactivo en lugar de eliminar
    paciente.estadoPaciente = false;
    await paciente.save();

    res.json({ 
      msg: "Paciente desactivado correctamente",
      paciente: {
        id: paciente._id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        estadoPaciente: paciente.estadoPaciente
      }
    });
  } catch (error) {
    console.error("❌ Error al desactivar paciente:", error);
    res.status(500).json({ msg: "Error al desactivar paciente" });
  }
};

export {
  registrarPaciente,
  loginPaciente,
  confirmarMailPaciente,
  perfilPaciente,
  actualizarPerfilPaciente,
  crearPacienteDoctor,
  listarPacientes,
  desactivarPaciente
};
