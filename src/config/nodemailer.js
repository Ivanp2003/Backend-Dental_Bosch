import nodemailer from "nodemailer"; // Librería para enviar correos desde Node.js
import dotenv from "dotenv"; // Permite usar variables de entorno desde un archivo .env

dotenv.config(); // Carga las variables de entorno definidas en .env

// Configuración para SendGrid API (HTTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // SendGrid usa STARTTLS
  auth: {
    user: 'apikey', // SendGrid siempre usa 'apikey' como usuario
    pass: process.env.SENDGRID_API_KEY, // Tu API Key de SendGrid
  },
});

// Para SendGrid API, no verificamos conexión al iniciar
console.log("📧 Configuración SendGrid API lista");

export default transporter; // Exporta el transportador para usarlo en otras partes del proyecto
