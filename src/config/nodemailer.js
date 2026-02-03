import nodemailer from "nodemailer"; // Librería para enviar correos desde Node.js
import dotenv from "dotenv"; // Permite usar variables de entorno desde un archivo .env

dotenv.config(); // Carga las variables de entorno definidas en .env

const transporter = nodemailer.createTransport({ // Crea el transportador de correo
  host: process.env.HOST_SENDGRID, // Host de SendGrid
  port: process.env.PORT_SENDGRID, // Puerto de SendGrid
  secure: false, // SendGrid usa TLS, no SSL
  auth: { // Configuración de autenticación del correo
    user: "apikey", // SendGrid siempre usa "apikey" como usuario
    pass: process.env.SENDGRID_API_KEY, // API Key de SendGrid
  },
});

// Verificar la conexión
transporter.verify((error, success) => { // Verifica que el servidor de correo esté correctamente configurado
  if (error) { // Si ocurre un error en la conexión o configuración
    console.log("❌ Error en la configuración de correo SendGrid:", error); // Muestra el error en consola
  } else { // Si la conexión es exitosa
    console.log("✅ Servidor SendGrid listo para enviar mensajes"); // Mensaje de confirmación
  }
});

export default transporter; // Exporta el transportador para usarlo en otras partes del proyecto
