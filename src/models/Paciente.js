import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const pacienteSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    cedula: { type: String, required: function() { return this.provider === 'local'; }, unique: true, sparse: true, trim: true },
    emailPaciente: { type: String, required: true, unique: true, trim: true },
    passwordPaciente: { type: String, required: function() { return this.provider === 'local'; } },
    telefono: { type: String, required: function() { return this.provider === 'local'; } },
    direccion: { type: String },
    fechaNacimiento: { type: Date, required: function() { return this.provider === 'local'; } },
    genero: {
      type: String,
      enum: ["Masculino", "Femenino", "Otro"],
      required: true
    },

    // Estado
    estadoPaciente: { type: Boolean, default: true },
    
    // Confirmación de email
    confirmado: { type: Boolean, default: false },
    token: { type: String, default: null },

    // Campos para Google OAuth
    googleId: { type: String, default: null, sparse: true },
    provider: { 
      type: String, 
      enum: ["local", "google"], 
      default: "local" 
    },

    // Relación (NO obligatoria al registrarse)
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null
    },

    rol: { 
      type: String, 
      enum: ["paciente", "doctor"],
      default: "paciente" 
    }
  },
  { timestamps: true }
);

// HASH PASSWORD
pacienteSchema.pre("save", async function () {
  if (!this.isModified("passwordPaciente")) return;

  const salt = await bcrypt.genSalt(10);
  this.passwordPaciente = await bcrypt.hash(this.passwordPaciente, salt);
});

// COMPARAR PASSWORD
pacienteSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordPaciente);
};

export default model("Paciente", pacienteSchema);
