// Back-Dental-Bosch/src/config/nodemailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.HOST_MAILTRAP,
  port: process.env.PORT_MAILTRAP,
  secure: true, // true para puerto 465
  auth: {
    user: process.env.USER_MAILTRAP,
    pass: process.env.PASS_MAILTRAP,
  },
});

// Verificar la conexión
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error en la configuración de correo:", error);
  } else {
    console.log("✅ Servidor de correo listo para enviar mensajes");
  }
});

export default transporter;