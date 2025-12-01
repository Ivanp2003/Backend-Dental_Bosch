// Back-Dental-Bosch/src/middlewares/JWT.js
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

export const verificarTokenJWT = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        msg: "No se proporcionó un token de autenticación" 
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el doctor en la base de datos
    const doctor = await Doctor.findById(decoded.id).select(
      "-password -token -__v"
    );

    if (!doctor) {
      return res.status(404).json({ 
        msg: "Doctor no encontrado" 
      });
    }

    if (!doctor.confirmado) {
      return res.status(403).json({ 
        msg: "La cuenta no ha sido confirmada" 
      });
    }

    // Agregar el doctor al request
    req.doctorHeader = doctor;
    next();

  } catch (error) {
    console.error(" Error al verificar token:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Token inválido" });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expirado" });
    }

    res.status(500).json({ msg: "Error al verificar el token" });
  }
};