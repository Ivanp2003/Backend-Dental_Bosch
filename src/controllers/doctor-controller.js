// Back-Dental-Bosch/src/controllers/doctor-controller.js
import Doctor from "../models/Doctor.js";
import crearJWT from "../helpers/crearJWT.js";
import { sendMailToRegister, sendMailToRecoveryPassword } from "../helpers/sendMail.js";
import crypto from "crypto";
import mongoose from "mongoose";

// REGISTRO
export const registro = async (req, res) => {
  try {
    const { email, nombre, apellido, password } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el doctor ya existe
    const existe = await Doctor.findOne({ email });
    if (existe) {
      return res.status(400).json({ msg: "El doctor ya está registrado" });
    }

    // Crear doctor
    const doctor = new Doctor(req.body);
    doctor.token = crypto.randomBytes(20).toString("hex");

    await doctor.save();

    // Enviar correo de confirmación
    await sendMailToRegister(email, nombre, doctor.token);

    res.json({ msg: "Registro exitoso. Revisa tu correo para confirmar" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error, intenta nuevamente" });
  }
};

// CONFIRMAR MAIL
export const confirmarMail = async (req, res) => {
  try {
    const { token } = req.params;

    const doctor = await Doctor.findOne({ token });
    if (!doctor) return res.status(400).json({ msg: "Token no válido" });

    // ✅ Usar updateOne para evitar el hook
    await Doctor.updateOne(
      { _id: doctor._id },
      { confirmado: true, token: "" }
    );

    res.json({ msg: "Cuenta confirmada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error al confirmar la cuenta" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ msg: "No existe esta cuenta" });

    if (!doctor.confirmado)
      return res.status(400).json({ msg: "La cuenta no ha sido confirmada" });

    const passwordCorrecto = await doctor.compararPassword(password);
    if (!passwordCorrecto)
      return res.status(400).json({ msg: "Contraseña incorrecta" });

    res.json({
      msg: "Login correcto",
      token: crearJWT(doctor._id),
      doctor: {
        id: doctor._id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        email: doctor.email,
        especialidad: doctor.especialidad,
        telefono: doctor.telefono,
        direccion: doctor.direccion,
        rol: doctor.rol
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error al iniciar sesión" });
  }
};

// RECUPERAR PASSWORD
export const recuperarPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("📧 Intentando recuperar password para:", email);

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      console.log("❌ Doctor no encontrado");
      return res.status(400).json({ msg: "No existe este email" });
    }

    console.log("✅ Doctor encontrado:", doctor.nombre, doctor.apellido);

    // Generar token
    const tokenRecuperacion = crypto.randomBytes(20).toString("hex");
    console.log("🔑 Token generado:", tokenRecuperacion);

    // ✅ USAR updateOne EN LUGAR DE save() para evitar el hook pre('save')
    await Doctor.updateOne(
      { _id: doctor._id },
      { token: tokenRecuperacion }
    );

    console.log("💾 Token guardado en BD");
    console.log("📨 Intentando enviar correo...");

    await sendMailToRecoveryPassword(
      email, 
      `${doctor.nombre} ${doctor.apellido}`, 
      tokenRecuperacion
    );

    console.log("✅ Correo enviado correctamente");

    res.json({ msg: "Hemos enviado instrucciones a tu email" });
  } catch (error) {
    console.log("❌ ERROR COMPLETO:", error);
    console.log("❌ ERROR MESSAGE:", error.message);
    res.status(500).json({ msg: "Hubo un error al recuperar la contraseña" });
  }
};

// COMPROBAR TOKEN DE PASSWORD
export const comprobarTokenPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const doctor = await Doctor.findOne({ token });
    if (!doctor) return res.status(400).json({ msg: "Token no válido" });

    res.json({ msg: "Token válido" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error al comprobar el token" });
  }
};

// CREAR NUEVO PASSWORD
export const crearNuevoPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    const doctor = await Doctor.findOne({ token });
    if (!doctor) return res.status(400).json({ msg: "Token no válido" });

    doctor.password = password;
    doctor.token = "";
    await doctor.save();

    res.json({ msg: "Contraseña modificada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error al cambiar la contraseña" });
  }
};

// PERFIL - Obtener datos del doctor autenticado
export const perfil = (req, res) => {
  const { token, confirmado, createdAt, updatedAt, __v, ...datosPerfil } = req.doctorHeader._doc;
  res.status(200).json(datosPerfil);
};

// ACTUALIZAR PERFIL
export const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, direccion, telefono, email, especialidad } = req.body;

    // Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID inválido: ${id}` });
    }

    // Verificar que el doctor existe
    const doctorBDD = await Doctor.findById(id);
    if (!doctorBDD) {
      return res.status(404).json({ msg: `No existe el doctor con ID ${id}` });
    }

    // Verificar que el usuario autenticado es el mismo que el perfil a actualizar
    if (req.doctorHeader._id.toString() !== id) {
      return res.status(403).json({ msg: "No tienes permisos para actualizar este perfil" });
    }

    // Validar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    // Verificar si el email cambió y si ya existe
    if (doctorBDD.email !== email) {
      const emailExistente = await Doctor.findOne({ email });
      if (emailExistente) {
        return res.status(400).json({ msg: "El email ya se encuentra registrado" });
      }
    }

    // Actualizar los campos
    doctorBDD.nombre = nombre ?? doctorBDD.nombre;
    doctorBDD.apellido = apellido ?? doctorBDD.apellido;
    doctorBDD.direccion = direccion ?? doctorBDD.direccion;
    doctorBDD.telefono = telefono ?? doctorBDD.telefono;
    doctorBDD.email = email ?? doctorBDD.email;
    doctorBDD.especialidad = especialidad ?? doctorBDD.especialidad;

    await doctorBDD.save();

    // Devolver el perfil actualizado sin datos sensibles
    const { password, token, __v, ...perfilActualizado } = doctorBDD._doc;

    res.status(200).json({
      msg: "Perfil actualizado correctamente",
      doctor: perfilActualizado,
    });

  } catch (error) {
    console.error(" Error al actualizar perfil:", error);
    res.status(500).json({ msg: `Error en el servidor - ${error.message}` });
  }
};
