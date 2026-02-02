import { Router } from "express";
import {
  crearCita,
  listarCitasPaciente,
  listarCitasDoctor,
  obtenerCita,
  actualizarCita,
  cancelarCita,
  calificarCita,
  obtenerHorariosDisponibles,
  eliminarCita
} from "../controllers/cita-controller.js";

import {
  verificarTokenJWT,
  verificarPaciente,
  verificarDoctor
} from "../middlewares/JWT.js";

const router = Router();

console.log(" [cita-routes.js] Rutas de citas cargadas.");

// RUTAS PÚBLICAS (sin autenticación)
router.get("/disponibles", obtenerHorariosDisponibles); // Obtener horarios disponibles
router.get("/doctor/prueba", listarCitasDoctor); // Ruta de prueba temporal
router.get("/prueba/:id", obtenerCita); // Ruta de prueba para obtener cita por ID sin autenticación
router.put("/prueba/:id", actualizarCita); // Ruta de prueba para actualizar
router.delete("/prueba/:id", eliminarCita); // Ruta de prueba para eliminar

// RUTAS PACIENTE (requieren token JWT y rol de paciente)
router.post("/crear", verificarTokenJWT, verificarPaciente, crearCita); // Crear cita
router.get("/paciente", verificarTokenJWT, verificarPaciente, listarCitasPaciente); // Listar citas del paciente
router.get("/:id", verificarTokenJWT, obtenerCita); // Obtener cita por ID (paciente o doctor)
router.put("/:id/cancelar", verificarTokenJWT, verificarPaciente, cancelarCita); // Cancelar cita
router.put("/:id/calificar", verificarTokenJWT, verificarPaciente, calificarCita); // Calificar cita

// RUTAS DOCTOR (requieren token JWT y rol de doctor)
router.get("/doctor", verificarTokenJWT, verificarDoctor, listarCitasDoctor); // Listar citas del doctor
router.put("/:id", verificarTokenJWT, verificarDoctor, actualizarCita); // Actualizar cita (solo doctor)
router.delete("/:id", verificarTokenJWT, verificarDoctor, eliminarCita); // Eliminar cita (solo doctor)

export default router;
