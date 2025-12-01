import { Router } from "express";
import {
  registro,
  confirmarMail,
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPassword,
  login,
  perfil,
  actualizarPerfil
} from "../controllers/doctor-controller.js";

import { verificarTokenJWT}from"../middlewares/JWT.js";

const router = Router();

console.log(" [doctor-routes.js] Rutas del doctor cargadas.");

router.post("/registro", registro);
router.get("/confirmar/:token", confirmarMail);//Consumir desde el front 

router.post("/recuperarPassword", recuperarPassword);
router.get("/recuperarPassword/:token", comprobarTokenPassword);//Consumir desde el front
router.post("/nuevoPassword/:token", crearNuevoPassword);

router.post("/login", login);

// Rutas protegidas (requieren token)
router.get('/perfil',verificarTokenJWT,perfil)
router.put('/actualizarperfil/:id',verificarTokenJWT,actualizarPerfil)
export default router;