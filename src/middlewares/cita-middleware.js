import mongoose from "mongoose";
import Paciente from "../models/Paciente.js";

// Middleware para crear o reutilizar paciente al agendar cita
export const crearOAReutilizarPaciente = async (req, res, next) => {
    try {
        const { emailPaciente, nombre, apellido, telefono } = req.body;

        // Si no se proporciona email, continuar sin crear paciente
        if (!emailPaciente) {
            return next();
        }

        // Buscar paciente existente por email
        let paciente = await Paciente.findOne({ emailPaciente });

        if (paciente) {
            // Reutilizar paciente existente
            req.pacienteCita = paciente;
            console.log("✅ Paciente existente reutilizado:", emailPaciente);
        } else {
            // Crear nuevo paciente automáticamente
            if (!nombre || !apellido) {
                return res.status(400).json({ 
                    msg: "Para crear un paciente automáticamente se requiere nombre y apellido" 
                });
            }

            paciente = new Paciente({
                nombre,
                apellido,
                emailPaciente,
                telefono: telefono || "",
                passwordPaciente: "TEMPORAL_" + Math.random().toString(36).substring(2), // Contraseña temporal aleatoria
                cedula: "TEMP_" + Math.random().toString(36).substring(2).toUpperCase(), // Cédula temporal
                fechaNacimiento: new Date(), // Fecha por defecto
                genero: "Otro", // Género por defecto
                direccion: "", // Dirección vacía por defecto
                estadoPaciente: true
            });

            await paciente.save();
            req.pacienteCita = paciente;
            console.log("✅ Nuevo paciente creado automáticamente:", emailPaciente);
        }

        next();
    } catch (error) {
        console.error("❌ Error al crear/reutilizar paciente:", error);
        res.status(500).json({ msg: "Error al procesar paciente para la cita" });
    }
};
