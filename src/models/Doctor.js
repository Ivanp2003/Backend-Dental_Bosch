// Back-Dental-Bosch/src/models/Doctor.js
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const doctorSchema = new Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
    confirmado: { type: Boolean, default: false },
    especialidad: { type: String },
    telefono: { type: String },
    direccion: { type: String },
    rol: { type: String, default: "doctor" }
  },
  { timestamps: true }
);

// Hash de contraseña - SIN next()
doctorSchema.pre("save", async function () {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified("password")) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseña
doctorSchema.methods.compararPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password);
};

export default model("Doctor", doctorSchema);