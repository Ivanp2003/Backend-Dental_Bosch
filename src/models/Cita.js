import { Schema, model } from "mongoose";

const citaSchema = new Schema(
  {
    // Paciente que solicita la cita
    paciente: {
      type: Schema.Types.ObjectId,
      ref: "Paciente",
      required: true
    },
    
    // Doctor que atenderá la cita
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    
    // Fecha y hora de la cita
    fechaCita: {
      type: Date,
      required: true
    },
    
    // Duración estimada en minutos
    duracion: {
      type: Number,
      default: 30, // 30 minutos por defecto
      min: 15,
      max: 180
    },
    
    // Tipo de consulta
    tipoConsulta: {
      type: String,
      enum: ["consulta_general", "limpieza", "extraccion", "ortodoncia", "blanqueamiento", "emergencia", "otro"],
      default: "consulta_general"
    },
    
    // Descripción del motivo de la cita
    motivo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    // Estado de la cita
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada", "completada", "no_asistio"],
      default: "pendiente"
    },
    
    // Notas adicionales del doctor
    notasDoctor: {
      type: String,
      maxlength: 1000
    },
    
    // Costo de la consulta
    costo: {
      type: Number,
      min: 0
    },
    
    // Método de pago
    metodoPago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia", "seguro", "pendiente"],
      default: "pendiente"
    },
    
    // Recordatorio enviado
    recordatorioEnviado: {
      type: Boolean,
      default: false
    },
    
    // Calificación de la cita (después de completada)
    calificacion: {
      type: Number,
      min: 1,
      max: 5
    },
    
    // Comentario del paciente
    comentarioPaciente: {
      type: String,
      maxlength: 500
    }
  },
  { 
    timestamps: true,
    // Índices para búsquedas eficientes
    index: { paciente: 1, fechaCita: -1 },
    index: { doctor: 1, fechaCita: -1 },
    index: { estado: 1 },
    index: { fechaCita: 1 }
  }
);

// Middleware para validar que la fecha de cita no sea en el pasado
// citaSchema.pre("save", async function(next) {
//   try {
//     if (this.fechaCita < new Date()) {
//       const error = new Error("La fecha de la cita no puede ser en el pasado");
//       return next(error);
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Método para verificar disponibilidad de horario
citaSchema.statics.verificarDisponibilidad = async function(doctorId, fechaCita, duracion = 30) {
  const fechaInicio = new Date(fechaCita);
  const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000); // duración en milisegundos
  
  // Buscar citas que se solapen con el horario solicitado
  const citasSolapadas = await this.find({
    doctor: doctorId,
    fechaCita: {
      $gte: fechaInicio,
      $lt: fechaFin
    },
    estado: { $in: ["pendiente", "confirmada"] }
  });
  
  return citasSolapadas.length === 0;
};

// Método para obtener citas de un paciente
citaSchema.statics.obtenerCitasPaciente = async function(pacienteId, estado = null) {
  const query = { paciente: pacienteId };
  if (estado) {
    query.estado = estado;
  }
  
  return await this.find(query)
    .populate("doctor", "nombre apellido email especialidad")
    .sort({ fechaCita: 1 });
};

// Método para obtener citas de un doctor
citaSchema.statics.obtenerCitasDoctor = async function(doctorId, fecha = null, estado = null) {
  const query = { doctor: doctorId };
  
  if (fecha) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);
    
    query.fechaCita = {
      $gte: inicioDia,
      $lte: finDia
    };
  }
  
  if (estado) {
    query.estado = estado;
  }
  
  return await this.find(query)
    .populate("paciente", "nombre apellido email telefono")
    .sort({ fechaCita: 1 });
};

export default model("Cita", citaSchema);
