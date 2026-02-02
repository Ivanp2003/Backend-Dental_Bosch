import Cita from "../models/Cita.js";
import Doctor from "../models/Doctor.js";
import Paciente from "../models/Paciente.js";
import { sendMailCitaConfirmada, sendMailCitaRecordatorio } from "../helpers/sendMail.js";

// CREAR CITA PACIENTE (NUEVO ENDPOINT /api/paciente/cita)
export const crearCitaPaciente = async (req, res) => {
  try {
    const { pacienteId, motivo, fecha } = req.body;

    // Validaciones básicas
    if (!pacienteId || !motivo || !fecha) {
      return res.status(400).json({ 
        msg: "El pacienteId, motivo y fecha son obligatorios" 
      });
    }

    // Verificar que el paciente exista
    const pacienteExistente = await Paciente.findById(pacienteId);
    if (!pacienteExistente) {
      return res.status(404).json({ msg: "Paciente no encontrado" });
    }

    // Buscar doctor aprobado (tomar el primero disponible)
    const doctorDisponible = await Doctor.findOne({ estado: "aprobado" });
    if (!doctorDisponible) {
      return res.status(404).json({ msg: "No hay doctores disponibles" });
    }

    // Verificar disponibilidad del horario
    const disponible = await Cita.verificarDisponibilidad(doctorDisponible._id, fecha, 30);
    if (!disponible) {
      return res.status(400).json({ 
        msg: "El horario seleccionado no está disponible" 
      });
    }

    // Crear la cita
    const cita = new Cita({
      paciente: pacienteId,
      doctor: doctorDisponible._id,
      fechaCita: new Date(fecha),
      duracion: 30,
      tipoConsulta: "consulta_general",
      motivo: motivo.trim(),
      costo: 0
    });

    await cita.save();

    // Poblar datos para la respuesta
    await cita.populate([
      { path: "doctor", select: "nombre apellido email especialidad" },
      { path: "paciente", select: "nombre apellido email telefono" }
    ]);

    // Enviar email de confirmación (opcional)
    try {
      await sendMailCitaConfirmada(cita.paciente.email, cita.paciente.nombre, cita);
    } catch (emailError) {
      console.log("Error al enviar email de confirmación:", emailError);
    }

    res.status(201).json({
      msg: "Cita creada exitosamente",
      pacienteId: pacienteId,
      motivo: motivo,
      fecha: fecha
    });

  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al crear la cita" 
    });
  }
};

// CREAR CITA (PACIENTE)
export const crearCita = async (req, res) => {
  try {
    const {
      doctor,
      fechaCita,
      duracion = 30,
      tipoConsulta = "consulta_general",
      motivo,
      costo
    } = req.body;

    // Validaciones básicas
    if (!doctor || !fechaCita || !motivo) {
      return res.status(400).json({ 
        msg: "El doctor, fecha y motivo son obligatorios" 
      });
    }

    // Verificar que el doctor exista y esté aprobado
    const doctorExistente = await Doctor.findById(doctor);
    if (!doctorExistente) {
      return res.status(404).json({ msg: "Doctor no encontrado" });
    }

    if (doctorExistente.estado !== "aprobado") {
      return res.status(400).json({ 
        msg: "El doctor no está disponible para atender citas" 
      });
    }

    // Verificar disponibilidad del horario
    const disponible = await Cita.verificarDisponibilidad(doctor, fechaCita, duracion);
    if (!disponible) {
      return res.status(400).json({ 
        msg: "El horario seleccionado no está disponible" 
      });
    }

    // Crear la cita
    const cita = new Cita({
      paciente: req.pacienteHeader._id,
      doctor,
      fechaCita: new Date(fechaCita),
      duracion,
      tipoConsulta,
      motivo: motivo.trim(),
      costo
    });

    await cita.save();

    // Poblar datos para la respuesta
    await cita.populate([
      { path: "doctor", select: "nombre apellido email especialidad" },
      { path: "paciente", select: "nombre apellido email telefono" }
    ]);

    // Enviar email de confirmación (opcional)
    try {
      await sendMailCitaConfirmada(cita.paciente.email, cita.paciente.nombre, cita);
    } catch (emailError) {
      console.log("Error al enviar email de confirmación:", emailError);
    }

    res.status(201).json({
      msg: "Cita creada exitosamente",
      doctor: doctor,
      fechaCita: fechaCita,
      motivo: motivo,
      duracion: duracion,
      tipoConsulta: tipoConsulta,
      costo: costo
    });

  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al crear la cita" 
    });
  }
};

// LISTAR CITAS DE PACIENTE
export const listarCitasPaciente = async (req, res) => {
  try {
    const { estado, fecha } = req.query;
    
    let citas;
    if (fecha) {
      // Citas de una fecha específica
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);
      
      citas = await Cita.find({
        paciente: req.pacienteHeader._id,
        fechaCita: { $gte: inicioDia, $lte: finDia }
      })
      .populate("doctor", "nombre apellido email especialidad telefono")
      .sort({ fechaCita: 1 });
    } else {
      // Todas las citas con filtro de estado opcional
      citas = await Cita.obtenerCitasPaciente(req.pacienteHeader._id, estado);
    }

    res.json(citas);

  } catch (error) {
    console.error("Error al listar citas de paciente:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al listar citas" 
    });
  }
};

// LISTAR CITAS DE DOCTOR
export const listarCitasDoctor = async (req, res) => {
  try {
    const { estado, fecha } = req.query;
    
    // Si no hay doctorHeader (ruta de prueba), usar un doctor fijo o buscar uno existente
    let doctorId;
    if (req.doctorHeader) {
      doctorId = req.doctorHeader._id.toString();
    } else {
      // Buscar cualquier doctor existente para pruebas
      const doctorExistente = await Doctor.findOne();
      if (doctorExistente) {
        doctorId = doctorExistente._id.toString();
      } else {
        // Si no hay doctores, devolver array vacío con mensaje
        return res.json([]);
      }
    }
    
    const citas = await Cita.obtenerCitasDoctor(doctorId, fecha, estado);

    res.json(citas);

  } catch (error) {
    console.error("Error al listar citas de doctor:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al listar citas" 
    });
  }
};

// OBTENER CITA POR ID
export const obtenerCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findById(id)
      .populate("doctor", "nombre apellido email especialidad telefono")
      .populate("paciente", "nombre apellido email telefono");

    if (!cita) {
      return res.status(404).json({ msg: "Cita no encontrada" });
    }

    // Verificar permisos solo si hay autenticación
    const pacienteId = req.pacienteHeader?._id;
    const doctorId = req.doctorHeader?._id;

    // Si no hay autenticación (ruta de prueba), permitir acceso
    if (!pacienteId && !doctorId) {
      return res.json(cita);
    }

    if (pacienteId && cita.paciente._id.toString() !== pacienteId) {
      return res.status(403).json({ msg: "No tienes permisos para ver esta cita" });
    }

    if (doctorId && cita.doctor._id.toString() !== doctorId) {
      return res.status(403).json({ msg: "No tienes permisos para ver esta cita" });
    }

    res.json(cita);

  } catch (error) {
    console.error("Error al obtener cita:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al obtener la cita" 
    });
  }
};

// ACTUALIZAR CITA (DOCTOR)
export const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notasDoctor, costo, metodoPago, duracion, observacion } = req.body;

    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ msg: "Cita no encontrada" });
    }

    // Verificar permisos solo si hay doctorHeader (ruta con autenticación)
    if (req.doctorHeader) {
      if (cita.doctor.toString() !== req.doctorHeader._id) {
        return res.status(403).json({ 
          msg: "No tienes permisos para modificar esta cita" 
        });
      }
    }
    // Si no hay doctorHeader (ruta de prueba), permitir la actualización

    // Actualizar campos permitidos
    if (estado) cita.estado = estado;
    if (notasDoctor) cita.notasDoctor = notasDoctor.trim();
    if (costo !== undefined) cita.costo = costo;
    if (metodoPago) cita.metodoPago = metodoPago;
    if (duracion !== undefined) cita.duracion = duracion;
    if (observacion) cita.notasDoctor = observacion.trim();

    await cita.save();

    await cita.populate([
      { path: "doctor", select: "nombre apellido email especialidad" },
      { path: "paciente", select: "nombre apellido email telefono" }
    ]);

    res.json({
      msg: "Cita actualizada exitosamente",
      cita
    });

  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al actualizar la cita" 
    });
  }
};

// CANCELAR CITA (PACIENTE)
export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ msg: "Cita no encontrada" });
    }

    // Verificar que el paciente sea el dueño de la cita
    if (cita.paciente.toString() !== req.pacienteHeader._id) {
      return res.status(403).json({ 
        msg: "No tienes permisos para cancelar esta cita" 
      });
    }

    // Solo se pueden cancelar citas pendientes o confirmadas
    if (!["pendiente", "confirmada"].includes(cita.estado)) {
      return res.status(400).json({ 
        msg: "Solo se pueden cancelar citas pendientes o confirmadas" 
      });
    }

    cita.estado = "cancelada";
    await cita.save();

    res.json({
      msg: "Cita cancelada exitosamente",
      cita
    });

  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al cancelar la cita" 
    });
  }
};

// CALIFICAR CITA (PACIENTE)
export const calificarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion, comentarioPaciente } = req.body;

    // Validar calificación
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ 
        msg: "La calificación debe estar entre 1 y 5" 
      });
    }

    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ msg: "Cita no encontrada" });
    }

    // Verificar que el paciente sea el dueño de la cita
    if (cita.paciente.toString() !== req.pacienteHeader._id) {
      return res.status(403).json({ 
        msg: "No tienes permisos para calificar esta cita" 
      });
    }

    // Solo se pueden calificar citas completadas
    if (cita.estado !== "completada") {
      return res.status(400).json({ 
        msg: "Solo se pueden calificar citas completadas" 
      });
    }

    cita.calificacion = calificacion;
    if (comentarioPaciente) {
      cita.comentarioPaciente = comentarioPaciente.trim();
    }

    await cita.save();

    res.json({
      msg: "Cita calificada exitosamente",
      cita
    });

  } catch (error) {
    console.error("Error al calificar cita:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al calificar la cita" 
    });
  }
};

// OBTENER HORARIOS DISPONIBLES DE UN DOCTOR
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { doctor, fecha } = req.query;

    if (!doctor || !fecha) {
      return res.status(400).json({ 
        msg: "El doctor y la fecha son obligatorios" 
      });
    }

    // Verificar que el doctor exista
    const doctorExistente = await Doctor.findById(doctor);
    if (!doctorExistente) {
      return res.status(404).json({ msg: "Doctor no encontrado" });
    }

    // Obtener todas las citas del doctor en esa fecha
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const citasDelDia = await Cita.find({
      doctor,
      fechaCita: { $gte: inicioDia, $lte: finDia },
      estado: { $in: ["pendiente", "confirmada"] }
    }).sort({ fechaCita: 1 });

    // Generar horarios disponibles (ejemplo: cada 30 minutos de 8am a 6pm)
    const horariosDisponibles = [];
    const horaInicio = 8; // 8am
    const horaFin = 18; // 6pm
    const duracionCita = 30; // 30 minutos

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += duracionCita) {
        const fechaHora = new Date(fecha);
        fechaHora.setHours(hora, minuto, 0, 0);

        // Verificar si este horario está disponible
        const horaFinCita = new Date(fechaHora.getTime() + duracionCita * 60000);
        
        const solapado = citasDelDia.some(cita => {
          const citaInicio = new Date(cita.fechaCita);
          const citaFin = new Date(citaInicio.getTime() + cita.duracion * 60000);
          
          return (fechaHora < citaFin && horaFinCita > citaInicio);
        });

        if (!solapado && fechaHora > new Date()) {
          horariosDisponibles.push({
            fecha: fechaHora,
            disponible: true
          });
        }
      }
    }

    res.json({
      doctor: doctorExistente.nombre + " " + doctorExistente.apellido,
      fecha,
      horariosDisponibles
    });

  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al obtener horarios disponibles" 
    });
  }
};

// ELIMINAR CITA (DOCTOR)
export const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ msg: "Cita no encontrada" });
    }

    // Verificar permisos solo si hay doctorHeader (ruta con autenticación)
    if (req.doctorHeader) {
      if (cita.doctor.toString() !== req.doctorHeader._id) {
        return res.status(403).json({ 
          msg: "No tienes permisos para eliminar esta cita" 
        });
      }
    }
    // Si no hay doctorHeader (ruta de prueba), permitir la eliminación

    // Eliminar la cita
    await Cita.findByIdAndDelete(id);

    res.json({
      msg: "Cita eliminada exitosamente",
      citaEliminada: {
        id: cita._id,
        paciente: cita.paciente,
        fechaCita: cita.fechaCita,
        motivo: cita.motivo
      }
    });

  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ 
      msg: "Error en el servidor al eliminar la cita" 
    });
  }
};
