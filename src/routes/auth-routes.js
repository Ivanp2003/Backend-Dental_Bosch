import { Router } from "express";
import { 
    crearDoctor, 
    promoverPacienteADoctor,
    listarDoctoresPendientes,
    aprobarDoctor,
    rechazarDoctor
} from "../controllers/auth-controller.js";
import { 
    verificarTokenJWT, 
    verificarDoctor 
} from "../middlewares/JWT.js";

const router = Router();

// Solo un doctor autenticado puede crear nuevos doctores
router.post("/crear-doctor", verificarTokenJWT, verificarDoctor, crearDoctor);

// Solo un doctor autenticado puede promover un paciente a doctor
router.put("/promover-paciente/:pacienteId", verificarTokenJWT, verificarDoctor, promoverPacienteADoctor);

// Solo un doctor autenticado puede listar doctores pendientes
router.get("/doctores-pendientes", verificarTokenJWT, verificarDoctor, listarDoctoresPendientes);

// Solo un doctor autenticado puede aprobar doctores pendientes
router.put("/aprobar-doctor/:doctorId", verificarTokenJWT, verificarDoctor, aprobarDoctor);

// Solo un doctor autenticado puede rechazar doctores pendientes
router.put("/rechazar-doctor/:doctorId", verificarTokenJWT, verificarDoctor, rechazarDoctor);

export default router;
