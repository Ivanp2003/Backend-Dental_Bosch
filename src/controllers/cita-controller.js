import Cita from "../models/Cita.js";
import Doctor from "../models/Doctor.js";
import Paciente from "../models/Paciente.js";
import { sendMailCitaConfirmada, sendMailCitaRecordatorio } from "../helpers/sendMail.js";
import mongoose from "mongoose";

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
    const { estado, fecha, limit = 50, page = 1 } = req.query;
    
    console.log('📋 Citas Paciente - Solicitando citas para paciente:', req.pacienteHeader._id);
    console.log('📋 Citas Paciente - Filtros:', { estado, fecha, limit, page });
    
    let citas;
    let query = { paciente: req.pacienteHeader._id };
    
    if (fecha) {
      // Citas de una fecha específica
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);
      
      query.fechaCita = { $gte: inicioDia, $lte: finDia };
    }
    
    if (estado) {
      query.estado = estado;
    }
    
    citas = await Cita.find(query)
      .populate("doctor", "nombre apellido email especialidad telefono")
      .sort({ fechaCita: -1 }) // Más recientes primero
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Cita.countDocuments(query);

    res.json({
      msg: "Citas del paciente obtenidas exitosamente",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      citas
    });

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
    const { estado, fecha, limit = 50, page = 1 } = req.query;
    
    console.log('📋 Citas Doctor - Solicitando citas para doctor:', req.doctorHeader?._id);
    console.log('📋 Citas Doctor - req.doctorHeader:', JSON.stringify(req.doctorHeader, null, 2));
    console.log('📋 Citas Doctor - req.doctorHeader._id:', req.doctorHeader?._id);
    console.log('📋 Citas Doctor - req.doctorHeader.id:', req.doctorHeader?.id);
    console.log('📋 Citas Doctor - typeof req.doctorHeader._id:', typeof req.doctorHeader?._id);
    console.log('📋 Citas Doctor - Filtros:', { estado, fecha, limit, page });
    
    if (!req.doctorHeader) {
      console.log('❌ No hay doctorHeader en la request');
      // Para ruta de prueba, usar un doctor por defecto
      const doctorId = "69806dddee81613e49041fc0"; // ID del doctor de prueba
      console.log('📋 Usando doctor de prueba:', doctorId);
      
      let citas;
      let query = { doctor: new mongoose.Types.ObjectId(doctorId) };
      
      if (fecha) {
        const inicioDia = new Date(fecha);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fecha);
        finDia.setHours(23, 59, 59, 999);
        query.fechaCita = { $gte: inicioDia, $lte: finDia };
      }
      
      if (estado) {
        query.estado = estado;
      }
      
      citas = await Cita.find(query)
        .populate("paciente", "nombre apellido email telefono")
        .sort({ fechaCita: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Cita.countDocuments(query);

      return res.json({
        msg: "Citas del doctor obtenidas exitosamente (prueba)",
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
        citas
      });
    }
    
    let citas;
    let query;
    
    try {
      query = { doctor: req.doctorHeader._id.toString() };
      console.log('✅ Query creada exitosamente:', query);
    } catch (error) {
      console.error('❌ Error al crear query:', error);
      return res.status(500).json({ msg: "Error al procesar ID del doctor" });
    }
    
    if (fecha) {
      // Citas de una fecha específica
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);
      
      query.fechaCita = { $gte: inicioDia, $lte: finDia };
    }
    
    if (estado) {
      query.estado = estado;
    }
    
    citas = await Cita.find(query)
      .populate("paciente", "nombre apellido email telefono")
      .sort({ fechaCita: 1 }) // Próximas primero
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Cita.countDocuments(query);

    res.json({
      msg: "Citas del doctor obtenidas exitosamente",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      citas
    });

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

    // Verificar permisos
    const pacienteId = req.pacienteHeader?._id;
    const doctorId = req.doctorHeader?._id;

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
    if (cita.paciente.toString() !== req.pacienteHeader._id.toString()) {
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
    if (cita.paciente.toString() !== req.pacienteHeader._id.toString()) {
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
    
    console.log('🔄 Horarios - Parámetros recibidos:', { doctor, fecha });

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
    
    console.log('✅ Horarios - Doctor encontrado:', doctorExistente.nombre);

    // Obtener todas las citas del doctor en esa fecha
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    console.log('📅 Horarios - Buscando citas entre:', inicioDia, 'y', finDia);

    const citasDelDia = await Cita.find({
      doctor,
      fechaCita: { $gte: inicioDia, $lte: finDia },
      estado: { $in: ["pendiente", "confirmada"] }
    }).sort({ fechaCita: 1 });
    
    console.log('📋 Horarios - Citas encontradas:', citasDelDia.length);

    // Generar horarios disponibles (ejemplo: cada 30 minutos de 8am a 6pm)
    const horariosDisponibles = [];
    const horaInicio = 8; // 8am
    const horaFin = 18; // 6pm
    const duracionCita = 30; // 30 minutos
    const ahora = new Date();
    
    console.log('⏰ Horarios - Generando horarios de', horaInicio, 'a', horaFin, 'horas');

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += duracionCita) {
        const fechaHora = new Date(fecha);
        // Ajustar para zona horaria local
        fechaHora.setHours(hora, minuto, 0, 0);

        // Verificar si este horario está disponible
        const horaFinCita = new Date(fechaHora.getTime() + duracionCita * 60000);
        
        const solapado = citasDelDia.some(cita => {
          const citaInicio = new Date(cita.fechaCita);
          const citaFin = new Date(citaInicio.getTime() + cita.duracion * 60000);
          
          return (fechaHora < citaFin && horaFinCita > citaInicio);
        });

        // Comparar con hora actual ajustada a la misma zona horaria
        const ahora = new Date();
        const ahoraLocal = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), ahora.getHours(), ahora.getMinutes());
        const esFuturo = fechaHora >= ahoraLocal;
        
        console.log(`🔍 Horario ${hora}:${minuto} - Disponible: ${!solapado}, Futuro: ${esFuturo}, Ahora: ${ahoraLocal}, Cita: ${fechaHora}`);

        // Temporalmente permitir todos los horarios disponibles para pruebas
        if (!solapado) {
          horariosDisponibles.push({
            fecha: fechaHora,
            disponible: true
          });
        }
      }
    }

    console.log('✅ Horarios - Horarios disponibles generados:', horariosDisponibles.length);

    res.json({
      doctor: doctorExistente.nombre + " " + doctorExistente.apellido,
      fecha,
      horariosDisponibles
    });

  } catch (error) {
    console.error("❌ Error al obtener horarios disponibles:", error);
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
