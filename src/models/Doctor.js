import { Schema, model } from "mongoose"; // Herramientas de Mongoose para definir esquemas y modelos
import bcrypt from "bcryptjs"; // Librería para hashear y comparar contraseñas

const doctorSchema = new Schema(
  {
    nombre: { type: String, required: true }, 
    apellido: { type: String, required: true }, 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    token: { type: String }, // Token para confirmación de cuenta o recuperación
    confirmado: { type: Boolean, default: false }, // Indica si la cuenta ha sido confirmada
    estado: { 
      type: String, 
      enum: ["pendiente", "aprobado", "rechazado"], 
      default: "pendiente" 
    }, // Estado de aprobación del doctor
    especialidad: { type: String }, 
    telefono: { type: String }, 
    direccion: { type: String }, 
    rol: { 
      type: String, 
      enum: ["doctor"], 
      default: "doctor" 
    } // Rol del usuario dentro del sistema
  },
  { timestamps: true } // Agrega automáticamente createdAt y updatedAt
);

// Middleware de Mongoose que hashea la contraseña antes de guardar el documento
doctorSchema.pre("save", async function () {
  // Evita volver a hashear la contraseña si no fue modificada
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10); // Genera el salt para el hash
  this.password = await bcrypt.hash(this.password, salt); // Hashea la contraseña
});

// Método personalizado para comparar la contraseña ingresada con la almacenada
doctorSchema.methods.compararPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password); // Retorna true o false
};

export default model("Doctor", doctorSchema); // Exporta el modelo Doctor para usarlo en la aplicación
