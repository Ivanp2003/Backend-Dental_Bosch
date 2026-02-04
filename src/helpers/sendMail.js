import transporter from "../config/nodemailer.js";

// Función para enviar correo de confirmación de registro
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

// Función para enviar correo con credenciales al paciente
export const sendMailToPatient = async (email, nombre, password) => {
  try {
    console.log("📨 Enviando credenciales al paciente:", email);
    
    const info = await transporter.sendMail({
      from: `"Dental Bosch" <${process.env.USER_MAILTRAP}>`,
      to: email,
      subject: "Bienvenido/a a Dental Bosch - Credenciales de acceso 🦷",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F47CC6; font-size: 2.5rem; margin: 0;">Dental Bosch 🦷</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #F47CC6; margin-top: 0;">¡Bienvenido/a ${nombre}!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Has sido registrado exitosamente en Dental Bosch. Estas son tus credenciales de acceso:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Contraseña:</strong> ${password}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.URL_FRONTEND}login" 
                 style="display: inline-block; padding: 12px 30px; background-color: #69D1D2; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                Iniciar sesión
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Te recomendamos cambiar tu contraseña después del primer inicio de sesión.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>El equipo de Dental Bosch te da la más cordial bienvenida.</p>
            <p>©${new Date().getFullYear()} Dental Bosch | Todos los derechos reservados</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Correo de credenciales enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error al enviar correo al paciente:", error);
    throw error;
  }
};

// Función para enviar correo de recuperación de contraseña
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

// Función para enviar correo de confirmación de cita
export const sendMailCitaConfirmada = async (email, nombre, cita) => {
  try {
    console.log("📨 Enviando correo de confirmación de cita a:", email);
    
    const info = await transporter.sendMail({
      from: `"Dental Bosch" <${process.env.USER_MAILTRAP}>`,
      to: email,
      subject: "Confirmación de Cita - Dental Bosch",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F47CC6; font-size: 2.5rem; margin: 0;">Dental Bosch 🦷</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #F47CC6; margin-top: 0;">¡Cita Confirmada!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola ${nombre}, tu cita ha sido agendada exitosamente.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Fecha:</strong> ${new Date(cita.fechaCita).toLocaleDateString('es-ES')}
              </p>
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Hora:</strong> ${new Date(cita.fechaCita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Tipo:</strong> ${cita.tipoConsulta}
              </p>
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Motivo:</strong> ${cita.motivo}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.URL_FRONTEND}paciente/perfil" 
                 style="display: inline-block; padding: 12px 30px; background-color: #69D1D2; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                Ver Mis Citas
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Por favor llega 10 minutos antes de tu cita.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>©${new Date().getFullYear()} Dental Bosch | Todos los derechos reservados</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Correo de confirmación de cita enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error al enviar correo de confirmación de cita:", error);
    throw error;
  }
};

// Función para enviar correo de recordatorio de cita
export const sendMailCitaRecordatorio = async (email, nombre, cita) => {
  try {
    console.log("📨 Enviando correo de recordatorio de cita a:", email);
    
    const info = await transporter.sendMail({
      from: `"Dental Bosch" <${process.env.USER_MAILTRAP}>`,
      to: email,
      subject: "Recordatorio de Cita - Dental Bosch",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F47CC6; font-size: 2.5rem; margin: 0;">Dental Bosch 🦷</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #F47CC6; margin-top: 0;">Recordatorio de Cita</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola ${nombre}, este es un recordatorio de tu cita programada para mañana.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Fecha:</strong> ${new Date(cita.fechaCita).toLocaleDateString('es-ES')}
              </p>
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Hora:</strong> ${new Date(cita.fechaCita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style="color: #333; font-size: 16px; margin: 5px 0;">
                <strong>Doctor:</strong> Dr. ${cita.doctor.nombre} ${cita.doctor.apellido}
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Si necesitas cancelar o reprogramar tu cita, por favor contáctanos.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>©${new Date().getFullYear()} Dental Bosch | Todos los derechos reservados</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Correo de recordatorio de cita enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error al enviar correo de recordatorio de cita:", error);
    throw error;
  }
};
