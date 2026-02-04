import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";
import Paciente from "../models/Paciente.js";

/**
 * ===============================
 * CREAR TOKEN JWT
 * ===============================
 * @param {string} id  - ID del usuario
 * @param {string} rol - Rol del usuario ("doctor" | "paciente")
 * @returns {string} JWT
 */
const crearJWT = (id, rol = "doctor") => {
  return jwt.sign(
    { id, rol },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export default crearJWT;

/**
 * ===============================
 * VERIFICAR TOKEN JWT
 * Autentica Doctor o Paciente
 * ===============================
 */
const verificarTokenJWT = async (req, res, next) => {
  try {
    console.log("🔐 JWT en:", req.method, req.originalUrl);

    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        msg: "No se proporcionó un token de autenticación"
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, rol } = decoded;

    // ===============================
    // DOCTOR
    // ===============================
    if (rol === "doctor") {
      console.log('🔐 JWT - Buscando doctor con ID:', id);
      console.log('🔐 JWT - Tipo de ID:', typeof id);
      
      const doctor = await Doctor.findById(id).select(
        "-password -token -__v"
      );

      console.log('🔐 JWT - Doctor encontrado:', doctor ? 'Sí' : 'No');
      if (doctor) {
        console.log('🔐 JWT - Doctor._id:', doctor._id);
        console.log('🔐 JWT - Doctor.id:', doctor.id);
      }

      if (!doctor) {
        return res.status(404).json({ msg: "Doctor no encontrado" });
      }

      // Validar que el doctor esté aprobado
      if (doctor.estado !== "aprobado") {
        return res.status(403).json({
          msg: `Tu cuenta está ${doctor.estado}. Debes ser aprobado por un doctor administrador para acceder.`
        });
      }

      req.doctorHeader = doctor;
      return next();
    }

    // ===============================
    // PACIENTE
    // ===============================
    if (rol === "paciente") {
      const paciente = await Paciente.findById(id).select(
        "-passwordPaciente -__v"
      );

      if (!paciente) {
        return res.status(404).json({ msg: "Paciente no encontrado" });
      }

      if (!paciente.confirmado) {
        return res.status(403).json({
          msg: "La cuenta no ha sido confirmada. Por favor, revisa tu correo"
        });
      }

      if (!paciente.estadoPaciente) {
        return res.status(403).json({
          msg: "Tu cuenta ha sido dada de baja. Contacta con el consultorio"
        });
      }

      req.pacienteHeader = paciente;
      return next();
    }

    // ===============================
    // ROL NO VÁLIDO
    // ===============================
    return res.status(403).json({ msg: "Rol no reconocido" });

  } catch (error) {
    console.error("❌ Error al verificar token:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Token inválido" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expirado" });
    }

    res.status(500).json({ msg: "Error al verificar el token" });
  }
};

/**
 * ===============================
 * SOLO DOCTOR
 * ===============================
 */
const verificarDoctor = (req, res, next) => {
  if (!req.doctorHeader) {
    return res.status(403).json({
      msg: "Acceso denegado: Solo doctores pueden realizar esta acción"
    });
  }
  next();
};

/**
 * ===============================
 * SOLO PACIENTE
 * ===============================
 */
const verificarPaciente = (req, res, next) => {
  if (!req.pacienteHeader) {
    return res.status(403).json({
      msg: "Acceso denegado: Solo pacientes pueden realizar esta acción"
    });
  }
  next();
};

export {
  crearJWT,
  verificarTokenJWT,
  verificarDoctor,
  verificarPaciente
};
