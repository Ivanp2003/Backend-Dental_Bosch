import { Router } from "express"; // Router de Express para definir rutas modulares

import {
  registro,
  confirmarMail,
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPassword,
  login,
  perfil,
  actualizarPerfil,
  actualizarPassword,
  listarDoctoresAprobados
} from "../controllers/doctor-controller.js"; // Controladores con la lógica de cada endpoint

import { verificarTokenJWT, verificarDoctor } from "../middlewares/JWT.js"; // Middleware para proteger rutas con JWT y verificar rol

const router = Router(); // Instancia del router de Express

console.log(" [doctor-routes.js] Rutas del doctor cargadas."); // Log para verificar que las rutas se cargaron correctamente

// Rutas públicas (no requieren autenticación)
router.post("/registro", registro); // Registro de un nuevo doctor
router.get("/confirmar/:token", confirmarMail); // Confirmación de cuenta mediante token (desde el front)
router.get("/aprobados", listarDoctoresAprobados); // Listar doctores aprobados (público)

router.post("/recuperarPassword", recuperarPassword); // Solicitud de recuperación de contraseña
router.get("/recuperarPassword/:token", comprobarTokenPassword); // Validación del token de recuperación (desde el front)
router.post("/nuevoPassword/:token", crearNuevoPassword); // Creación de nueva contraseña

router.post("/login", login); // Inicio de sesión y generación del JWT

// Rutas protegidas (requieren token JWT válido y rol de doctor)
router.get("/perfil", verificarTokenJWT, verificarDoctor, perfil); // Obtiene el perfil del doctor autenticado
router.put("/actualizarperfil/:id", verificarTokenJWT, verificarDoctor, actualizarPerfil); // Actualiza la información del perfil
router.put("/actualizarpassword/:id", verificarTokenJWT, verificarDoctor, actualizarPassword); // Actualiza la contraseña del doctor autenticado

export default router; // Exporta el router para ser usado en la aplicación principal
