import { Router } from "express";
import passport from "passport";
import {
  registrarPaciente,
  loginPaciente,
  confirmarMailPaciente,
  perfilPaciente,
  actualizarPerfilPaciente,
  crearPacienteDoctor,
  listarPacientes,
  desactivarPaciente
} from "../controllers/paciente-controller.js";
import { crearCitaPaciente } from "../controllers/cita-controller.js";
import Paciente from "../models/Paciente.js";

import {
  verificarTokenJWT,
  verificarPaciente,
  verificarDoctor,
  crearJWT
} from "../middlewares/JWT.js";

const router = Router();

// Rutas de Google OAuth
router.get('/auth/google', passport.authenticate('google-paciente', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/callback', 
  passport.authenticate('google-paciente', { 
    failureRedirect: `${process.env.URL_FRONTEND || 'http://localhost:5174'}/login-paciente`,
    session: false 
  }),
  (req, res) => {
    // Crear token JWT para el usuario autenticado con Google
    const token = crearJWT({ id: req.user._id, rol: 'paciente' });
    
    // Redirigir al frontend con el token
    res.redirect(`${process.env.URL_FRONTEND || 'http://localhost:5174'}/auth/google-success?token=${token}`);
  }
);

console.log(" [paciente-routes.js] Rutas del paciente cargadas."); // Log para verificar que las rutas se cargaron correctamente

// RUTAS PÚBLICAS
router.post("/registro", registrarPaciente);
router.post("/login", loginPaciente);
router.get("/confirmar/:token", confirmarMailPaciente);
router.get("/debug/tokens", async (req, res) => {
  try {
    const pacientes = await Paciente.find({})
      .select('nombre emailPaciente token confirmado createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(pacientes);
  } catch (error) {
    console.error("Error al obtener tokens:", error);
    res.status(500).json({ msg: "Error al obtener tokens" });
  }
});

// RUTAS PACIENTE (JWT)
router.get("/perfil", verificarTokenJWT, verificarPaciente, perfilPaciente);
router.put("/perfil", verificarTokenJWT, verificarPaciente, actualizarPerfilPaciente);
router.post("/cita", verificarTokenJWT, verificarPaciente, crearCitaPaciente);

// RUTAS DOCTOR
router.get("/", verificarTokenJWT, verificarDoctor, listarPacientes);
router.post(
  "/",
  verificarTokenJWT,
  verificarDoctor,
  crearPacienteDoctor
);
router.delete("/:id", verificarTokenJWT, verificarDoctor, desactivarPaciente);

export default router;
