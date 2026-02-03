import { sendEmail } from "../config/sendgrid.js";

// Función para enviar correo de confirmación de registro
export const sendMailToRegister = async (email, nombre, token) => {
  try {
    console.log("📨 Enviando correo de registro a:", email);
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F47CC6; font-size: 2.5rem; margin: 0;">Dental Bosch</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #F47CC6; margin-top: 0;">¡Bienvenido/a ${nombre}!</h2>
            <p>Gracias por registrarte en Dental Bosch. Para completar tu registro, por favor confirma tu cuenta haciendo clic en el siguiente enlace:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.URL_BACKEND}paciente/confirmar/${token}" 
                 style="background-color: #F47CC6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Confirmar Cuenta
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Este enlace expirará en 24 horas. Si no creaste esta cuenta, puedes ignorar este correo.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
            <p>© 2024 Dental Bosch - Todos los derechos reservados</p>
          </div>
        </div>
    `;
    
    const result = await sendEmail(email, "Confirma tu cuenta en Dental Bosch", html);
    console.log("✅ Correo de registro enviado correctamente");
    return result;
  } catch (error) {
    console.error("❌ Error al enviar correo de registro:", error.message);
    throw error;
  }
};

// Función para enviar correo con credenciales al paciente
export const sendMailToPatient = async (email, nombre, password) => {
  try {
    console.log("📨 Enviando credenciales al paciente:", email);
    
    const html = `
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
    `;
    
    const result = await sendEmail(email, "Bienvenido/a a Dental Bosch - Credenciales de acceso 🦷", html);
    console.log("✅ Correo de credenciales enviado correctamente");
    return result;
  } catch (error) {
    console.error("❌ Error al enviar correo al paciente:", error.message);
    throw error;
  }
};

// Función para enviar correo de recuperación de contraseña
export const sendMailToRecoveryPassword = async (email, nombre, token) => {
  try {
    console.log("📨 Enviando correo de recuperación a:", email);
    
    const html = `
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
    `;
    
    const result = await sendEmail(email, "Recuperación de contraseña - Dental Bosch", html);
    console.log("✅ Correo de recuperación enviado correctamente");
    return result;
  } catch (error) {
    console.error("❌ Error al enviar correo de recuperación:", error.message);
    throw error;
  }
};

// Función para enviar correo de confirmación de cita
export const sendMailCitaConfirmada = async (email, nombre, cita) => {
  try {
    console.log("📨 Enviando correo de confirmación de cita a:", email);
    
    const html = `
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
    `;
    
    const result = await sendEmail(email, "Confirmación de Cita - Dental Bosch", html);
    console.log("✅ Correo de confirmación de cita enviado correctamente");
    return result;
  } catch (error) {
    console.error("❌ Error al enviar correo de confirmación de cita:", error.message);
    throw error;
  }
};

// Función para enviar correo de recordatorio de cita
export const sendMailCitaRecordatorio = async (email, nombre, cita) => {
  try {
    console.log("📨 Enviando correo de recordatorio de cita a:", email);
    
    const html = `
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
              Por favor llega 10 minutos antes de tu cita. Si necesitas cancelar, contáctanos con anticipación.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>©${new Date().getFullYear()} Dental Bosch | Todos los derechos reservados</p>
          </div>
        </div>
    `;
    
    const result = await sendEmail(email, "Recordatorio de Cita - Dental Bosch", html);
    console.log("✅ Correo de recordatorio de cita enviado correctamente");
    return result;
  } catch (error) {
    console.error("❌ Error al enviar correo de recordatorio de cita:", error.message);
    throw error;
  }
};
