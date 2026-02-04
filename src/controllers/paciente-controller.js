import Paciente from "../models/Paciente.js";
import bcrypt from "bcryptjs";
import crearJWT from "../helpers/crearJWT.js";
import { sendMailToRegister } from "../helpers/sendMail.js";
import crypto from "crypto";

// LISTAR PACIENTES (solo doctores)
const listarPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find()
      .select("-passwordPaciente -__v")
      .sort({ createdAt: -1 });

    res.json(pacientes);
  } catch (error) {
    console.error("Error al listar pacientes:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// REGISTRO PACIENTE (PÚBLICO)
const registrarPaciente = async (req, res) => {
  try {
    console.log("📥 Datos recibidos en registro paciente:", req.body);
    
    const {
      nombre,
      apellido,
      cedula,
      emailPaciente,
      password,
      telefono,
      fechaNacimiento,
      genero
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !cedula ||
      !emailPaciente ||
      !password ||
      !telefono ||
      !fechaNacimiento ||
      !genero
    ) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existeEmail = await Paciente.findOne({ emailPaciente });
    if (existeEmail) {
      return res.status(400).json({ msg: "El email ya está registrado" });
    }

    const existeCedula = await Paciente.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({ msg: "La cédula ya está registrada" });
    }

    console.log("✅ Validaciones pasadas, creando paciente...");
    console.log("📅 Fecha de nacimiento recibida:", fechaNacimiento);
    console.log("📅 Tipo de fechaNacimiento:", typeof fechaNacimiento);

    const paciente = new Paciente({
      nombre,
      apellido,
      cedula,
      emailPaciente,
      passwordPaciente: password,
      telefono,
      fechaNacimiento,
      genero,
      token: crypto.randomBytes(20).toString("hex"),
      confirmado: false
    });

    console.log("👤 Paciente creado, intentando guardar...");
    await paciente.save();
    console.log("✅ Paciente guardado exitosamente");

    // Enviar correo de confirmación
    await sendMailToRegister(emailPaciente, nombre, paciente.token);

    res.status(201).json({
      msg: "Registro exitoso. Por favor, revisa tu correo para confirmar tu cuenta"
    });
  } catch (error) {
    console.error("❌ Error completo al registrar paciente:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};


// LOGIN PACIENTE
const loginPaciente = async (req, res) => {
  try {
    const { email, emailPaciente, password } = req.body;
    
    // Aceptar tanto 'email' como 'emailPaciente'
    const emailField = email || emailPaciente;

    const paciente = await Paciente.findOne({ emailPaciente: emailField });
    if (!paciente) {
      return res.status(404).json({ msg: "Paciente no registrado" });
    }

    if (!paciente.estadoPaciente) {
      return res.status(403).json({ msg: "Cuenta desactivada" });
    }

    if (!paciente.confirmado) {
      return res.status(403).json({ msg: "La cuenta no ha sido confirmada. Por favor, revisa tu correo" });
    }

    const passwordValido = await paciente.matchPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const token = crearJWT(paciente._id, "paciente");

    res.status(200).json({
      token,
      paciente: {
        id: paciente._id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        email: paciente.emailPaciente,
        rol: paciente.rol
      }
    });
  } catch (error) {
    console.error("❌ Error completo al registrar paciente:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// CONFIRMAR EMAIL PACIENTE
const confirmarMailPaciente = async (req, res) => {
  try {
    const { token } = req.params;

    const paciente = await Paciente.findOne({ token });
    if (!paciente) return res.status(400).json({ msg: "Token no válido" });

    await Paciente.updateOne(
      { _id: paciente._id },
      { confirmado: true, token: "" }
    );

    res.json({ 
      msg: "Cuenta confirmada correctamente. Ya puedes iniciar sesión" 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error al confirmar la cuenta" });
  }
};

// PERFIL PACIENTE
const perfilPaciente = (req, res) => {
  const { passwordPaciente, __v, ...perfil } = req.pacienteHeader._doc;
  res.json(perfil);
};

// ACTUALIZAR PERFIL PACIENTE
const actualizarPerfilPaciente = async (req, res) => {
  try {
    console.log("📥 Datos recibidos para actualizar perfil paciente:", req.body);
    console.log("👤 ID del paciente desde token:", req.pacienteHeader._id);
    
    const paciente = await Paciente.findById(req.pacienteHeader._id);
    
    if (!paciente) {
      console.log("❌ Paciente no encontrado");
      return res.status(404).json({ msg: "Paciente no encontrado" });
    }

    console.log("✅ Paciente encontrado:", paciente.nombre, paciente.apellido);
    console.log("📝 Actualizando campos...");

    // Actualizar los campos usando la misma lógica que el doctor (nullish coalescing)
    const { nombre, apellido, telefono, direccion } = req.body;
    
    paciente.nombre = nombre ?? paciente.nombre;
    paciente.apellido = apellido ?? paciente.apellido;
    paciente.telefono = telefono ?? paciente.telefono;
    paciente.direccion = direccion ?? paciente.direccion;

    console.log("💾 Guardando cambios...");
    console.log("📊 Estado del paciente antes de guardar:", {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      telefono: paciente.telefono,
      direccion: paciente.direccion
    });
    
    await paciente.save();
    console.log("✅ Paciente actualizado exitosamente");

    // Devolver los datos actualizados del paciente
    const { passwordPaciente, __v, ...perfilActualizado } = paciente._doc;
    res.json({ 
      msg: "Perfil actualizado",
      paciente: perfilActualizado
    });
  } catch (error) {
    console.error("❌ Error completo al actualizar perfil:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error name:", error.name);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error("❌ Errores de validación:", errors);
      return res.status(400).json({ 
        msg: "Error de validación", 
        errors: errors 
      });
    }
    
    // Manejar errores de duplicado
    if (error.code === 11000) {
      console.error("❌ Error de duplicado:", error.keyValue);
      return res.status(400).json({ 
        msg: "Ya existe un registro con esos datos" 
      });
    }
    
    res.status(500).json({ msg: "Error en el servidor al actualizar perfil" });
  }
};

const crearPacienteDoctor = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      cedula,
      emailPaciente,
      telefono,
      direccion,
      fechaNacimiento,
      genero
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !cedula ||
      !emailPaciente ||
      !telefono ||
      !fechaNacimiento ||
      !genero
    ) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const existeEmail = await Paciente.findOne({ emailPaciente });
    if (existeEmail) {
      return res.status(400).json({ msg: "El email ya está registrado" });
    }

    const existeCedula = await Paciente.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({ msg: "La cédula ya está registrada" });
    }

    const paciente = new Paciente({
      nombre,
      apellido,
      cedula,
      emailPaciente,
      telefono,
      direccion,
      fechaNacimiento,
      genero,
      doctor: req.doctorHeader._id,
      passwordPaciente: "TEMPORAL123" // no se usará
    });

    await paciente.save();

    res.status(201).json({
      msg: "Paciente creado correctamente",
      paciente
    });
  } catch (error) {
    console.error("❌ Error crearPacienteDoctor:", error);
    res.status(500).json({ msg: "Error al crear paciente" });
  }
};

// DESACTIVAR PACIENTE (cambiar estado a inactivo)
const desactivarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({ msg: "Paciente no encontrado" });
    }

    // Cambiar estado a inactivo en lugar de eliminar
    paciente.estadoPaciente = false;
    await paciente.save();

    res.json({ 
      msg: "Paciente desactivado correctamente",
      paciente: {
        id: paciente._id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        estadoPaciente: paciente.estadoPaciente
      }
    });
  } catch (error) {
    console.error("❌ Error al desactivar paciente:", error);
    res.status(500).json({ msg: "Error al desactivar paciente" });
  }
};

// ACTUALIZAR CONTRASEÑA DEL PACIENTE
const actualizarPasswordPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordActual, passwordNuevo } = req.body;

    // Validar que el ID sea válido
    if (!id) {
      return res.status(400).json({ msg: "ID inválido" });
    }

    // Verificar que el paciente existe
    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({ msg: `No existe el paciente con ID ${id}` });
    }

    // Verificar que el usuario autenticado es el mismo que va a actualizar la contraseña
    if (req.pacienteHeader._id.toString() !== id) {
      return res.status(403).json({ msg: "No tienes permisos para actualizar esta contraseña" });
    }

    // Validaciones básicas
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ 
        msg: "La contraseña actual y la nueva contraseña son obligatorias" 
      });
    }

    if (passwordNuevo.length < 6) {
      return res.status(400).json({ 
        msg: "La nueva contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Verificar contraseña actual
    const passwordCorrecto = await paciente.matchPassword(passwordActual);
    if (!passwordCorrecto) {
      return res.status(400).json({ msg: "La contraseña actual es incorrecta" });
    }

    // Actualizar contraseña
    paciente.passwordPaciente = passwordNuevo;
    await paciente.save();

    res.json({ 
      msg: "Contraseña actualizada exitosamente"
    });

  } catch (error) {
    console.error("❌ Error al actualizar contraseña del paciente:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al actualizar la contraseña" 
    });
  }
};

export {
  registrarPaciente,
  loginPaciente,
  confirmarMailPaciente,
  perfilPaciente,
  actualizarPerfilPaciente,
  actualizarPasswordPaciente,
  crearPacienteDoctor,
  listarPacientes,
  desactivarPaciente
};
