import { Router } from 'express';
import mongoose from 'mongoose';
import {
  crearItemInventario,
  listarInventario,
  obtenerItemInventario,
  actualizarItemInventario,
  eliminarItemInventario,
  actualizarStock
} from '../controllers/inventario-controller.js';
import { verificarTokenJWT, verificarDoctor } from '../middlewares/JWT.js';
import Inventario from '../models/Inventario.js';

const router = Router();

console.log(" [inventario-routes.js] Rutas de inventario cargadas.");

// Todas las rutas requieren doctor autenticado
router.use(verificarTokenJWT, verificarDoctor);

// CRUD básico de inventario
router.post('/', crearItemInventario); // Crear item
router.get('/', listarInventario); // Listar items con filtros
router.get('/:id', obtenerItemInventario); // Obtener item por ID
router.put('/:id', actualizarItemInventario); // Actualizar item
router.put('/:id/actualizar-stock', actualizarStock); // Actualizar/descontar stock
router.delete('/:id', eliminarItemInventario); // Eliminar item

export default router;
