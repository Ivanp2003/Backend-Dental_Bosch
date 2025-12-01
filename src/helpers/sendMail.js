// Back-Dental-Bosch/helpers/sendMail.js
import transporter from "../config/nodemailer.js";

export const sendMailToRegister = async (email, nombre, token) => {
  try {
    console.log("📨 Enviando correo de registro a:", email);
    
    const info = await transporter.sendMail({
      from: `"Dental Bosch" <${process.env.USER_MAILTRAP}>`,
      to: email,
      subject: "Confirma tu cuenta en Dental Bosch",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F47CC6; font-size: 2.5rem; margin: 0;">Dental Bosch</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #F47CC6; margin-top: 0;">¡Bienvenido/a ${nombre}!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Gracias por registrarte en Dental Bosch. Para confirmar tu cuenta, haz clic en el siguiente botón:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.URL_FRONTEND}confirmar/${token}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #69D1D2; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                Confirmar cuenta
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Si no solicitaste este registro, simplemente ignora este correo.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>©${new Date().getFullYear()} Dental Bosch | Todos los derechos reservados</p>
          </div>
        </div>
      `,
    });

    console.log("Correo de registro enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error(" Error al enviar correo de registro:", error);
    throw error;
  }
};

export const sendMailToRecoveryPassword = async (email, nombre, token) => {
  try {
    console.log("📨 Enviando correo de recuperación a:", email);
    
    const info = await transporter.sendMail({
      from: `"Dental Bosch" <${process.env.USER_MAILTRAP}>`,
      to: email,
      subject: "Recuperación de contraseña - Dental Bosch",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F47CC6; font-size: 2.5rem; margin: 0;">Dental Bosch</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #F47CC6; margin-top: 0;">Recuperación de contraseña</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola ${nombre},
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.URL_FRONTEND}nuevo-password/${token}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #F47CC6; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                Restablecer contraseña
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Si no solicitaste restablecer tu contraseña, ignora este correo.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>©${new Date().getFullYear()} Dental Bosch | Todos los derechos reservados</p>
          </div>
        </div>
      `,
    });

    console.log(" Correo de recuperación enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);
    throw error;
  }
};