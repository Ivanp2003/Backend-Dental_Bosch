import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Configurar SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Verificar configuración
if (!process.env.SENDGRID_API_KEY) {
  console.log("❌ SENDGRID_API_KEY no configurada");
} else {
  console.log("✅ SendGrid API configurada correctamente");
}

// Función para enviar correo con SendGrid API
export const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to: to,
      from: process.env.EMAIL_FROM,
      subject: subject,
      html: html,
    };

    const result = await sgMail.send(msg);
    console.log("✅ Email enviado con SendGrid:", result[0].statusCode);
    return result;
  } catch (error) {
    console.error("❌ Error al enviar email con SendGrid:", error.response?.body || error.message);
    throw error;
  }
};

export default sendEmail;
