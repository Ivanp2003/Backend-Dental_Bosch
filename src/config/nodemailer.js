import nodemailer from "nodemailer"; // Librería para enviar correos desde Node.js
import dotenv from "dotenv"; // Permite usar variables de entorno desde un archivo .env

dotenv.config(); // Carga las variables de entorno definidas en .env

<<<<<<< HEAD
const transporter = nodemailer.createTransport({ // Crea el transportador de correo
  service: "gmail", // Servicio de correo que se va a utilizar
  host: process.env.HOST_MAILTRAP, // Host del servidor de correo desde variables de entorno
  port: process.env.PORT_MAILTRAP, // Puerto del servidor de correo desde variables de entorno
  secure: true, // Indica que la conexión es segura (usado normalmente con el puerto 465)
  auth: { // Configuración de autenticación del correo
    user: process.env.USER_MAILTRAP, // Usuario o correo electrónico
    pass: process.env.PASS_MAILTRAP, // Contraseña o token del correo
  },
});

// Verificar la conexión
transporter.verify((error, success) => { // Verifica que el servidor de correo esté correctamente configurado
  if (error) { // Si ocurre un error en la conexión o configuración
    console.log("❌ Error en la configuración de correo:", error); // Muestra el error en consola
  } else { // Si la conexión es exitosa
    console.log("✅ Servidor de correo listo para enviar mensajes"); // Mensaje de confirmación
  }
});
=======
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
>>>>>>> 67d04d6 (SendGrid)

export default transporter; // Exporta el transportador para usarlo en otras partes del proyecto
