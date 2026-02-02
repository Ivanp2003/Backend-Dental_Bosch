import Inventario from '../models/Inventario.js';
import Doctor from '../models/Doctor.js';

// Crear nuevo item de inventario
const crearItemInventario = async (req, res) => {
  try {
    console.log("📥 Datos recibidos en inventario:", req.body);
    
    const { nombre, categoria, codigo, cantidad, stockMinimo, stockMaximo, unidadMedida, precioCompra, precioVenta } = req.body;

    // Validar campos obligatorios
    if (!nombre || !categoria || !codigo || !cantidad || !stockMinimo || !stockMaximo || !unidadMedida || !precioCompra || !precioVenta) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    // Validar stock máximo sea mayor que stock mínimo
    if (stockMaximo <= stockMinimo) {
      return res.status(400).json({
        msg: 'El stock máximo debe ser mayor que el stock mínimo'
      });
    }

    // Validar precio de venta sea mayor o igual al precio de compra
    if (precioVenta < precioCompra) {
      return res.status(400).json({
        msg: 'El precio de venta debe ser mayor o igual al precio de compra'
      });
    }

    // Verificar que el código no exista
    const codigoExistente = await Inventario.findOne({ 
      codigo: codigo.toUpperCase() 
    });
    
    if (codigoExistente) {
      return res.status(400).json({
        msg: 'Ya existe un item con este código en el inventario'
      });
    }

    const itemData = {
      ...req.body,
      codigo: codigo.toUpperCase(),
      doctorCreador: req.doctorHeader._id
    };

    console.log("📦 Creando item con datos:", itemData);

    const newItem = new Inventario(itemData);
    
    console.log("📦 Guardando en MongoDB...");
    try {
      const savedItem = await newItem.save();
      console.log("✅ Item guardado exitosamente en MongoDB:", savedItem);
      console.log("🆔 ID del item guardado:", savedItem._id);
      
      res.status(201).json({
        msg: 'Item de inventario creado correctamente',
        item: savedItem
      });
    } catch (saveError) {
      console.error("❌ Error al guardar en MongoDB:", saveError);
      return res.status(500).json({
        msg: 'Error al guardar en MongoDB',
        error: saveError.message
      });
    }

  } catch (error) {
    console.error('❌ Error al crear item de inventario:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        msg: 'Error de validación',
        errores
      });
    }
    
    res.status(500).json({
      msg: 'Error al crear item de inventario'
    });
  }
};

// Listar todos los items de inventario
const listarInventario = async (req, res) => {
  try {
    const doctorId = req.doctorHeader._id;
    
    // Verificar que el doctor esté aprobado
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.estado !== 'aprobado') {
      return res.status(403).json({
        msg: 'No tienes permisos para ver el inventario'
      });
    }

    const { 
      page = 1, 
      limit = 10, 
      categoria, 
      estado, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filtros = {};
    
    if (categoria) {
      filtros.categoria = categoria;
    }
    
    if (estado) {
      filtros.estado = estado;
    }
    
    if (search) {
      filtros.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } },
        { proveedor: { $regex: search, $options: 'i' } }
      ];
    }

    // Construir ordenamiento
    const ordenamiento = {};
    ordenamiento[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Inventario.find(filtros)
        .populate('doctorCreador', 'nombre apellido')
        .populate('doctorActualizador', 'nombre apellido')
        .sort(ordenamiento)
        .skip(skip)
        .limit(parseInt(limit)),
      Inventario.countDocuments(filtros)
    ]);

    // Calcular estadísticas
    const stats = await Inventario.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$cantidad' },
          valorTotal: { $sum: { $multiply: ['$cantidad', '$precioCompra'] } },
          itemsBajoStock: {
            $sum: {
              $cond: [{ $lte: ['$cantidad', '$stockMinimo'] }, 1, 0]
            }
          },
          itemsAgotados: {
            $sum: {
              $cond: [{ $eq: ['$estado', 'Agotado'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalItems: 0,
        valorTotal: 0,
        itemsBajoStock: 0,
        itemsAgotados: 0
      }
    });

  } catch (error) {
    console.error('Error al listar inventario:', error);
    res.status(500).json({
      msg: 'Error al listar inventario'
    });
  }
};

// Obtener item de inventario por ID
const obtenerItemInventario = async (req, res) => {
  try {
    const doctorId = req.doctorHeader._id;
    const { id } = req.params;

    // Verificar que el doctor esté aprobado
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.estado !== 'aprobado') {
      return res.status(403).json({
        msg: 'No tienes permisos para ver este item'
      });
    }

    const item = await Inventario.findById(id)
      .populate('doctorCreador', 'nombre apellido email')
      .populate('doctorActualizador', 'nombre apellido email');

    if (!item) {
      return res.status(404).json({
        msg: 'Item de inventario no encontrado'
      });
    }

    res.json({
      item
    });

  } catch (error) {
    console.error('Error al obtener item de inventario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        msg: 'ID de item no válido'
      });
    }
    
    res.status(500).json({
      msg: 'Error al obtener item de inventario'
    });
  }
};

// Actualizar item de inventario
const actualizarItemInventario = async (req, res) => {
  try {
    const doctorId = req.doctorHeader._id;
    const { id } = req.params;

    // Verificar que el doctor esté aprobado
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.estado !== 'aprobado') {
      return res.status(403).json({
        msg: 'No tienes permisos para actualizar items de inventario'
      });
    }

    const item = await Inventario.findById(id);

    if (!item) {
      return res.status(404).json({
        msg: 'Item de inventario no encontrado'
      });
    }

    // Si se va a actualizar el código, verificar que no exista
    if (req.body.codigo && req.body.codigo !== item.codigo) {
      const codigoExistente = await Inventario.findOne({ 
        codigo: req.body.codigo.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (codigoExistente) {
        return res.status(400).json({
          msg: 'Ya existe un item con este código en el inventario'
        });
      }
    }

    // Validaciones
    const updateData = { ...req.body };
    
    if (updateData.codigo) {
      updateData.codigo = updateData.codigo.toUpperCase();
    }

    if (updateData.stockMaximo && updateData.stockMinimo) {
      if (updateData.stockMaximo <= updateData.stockMinimo) {
        return res.status(400).json({
          msg: 'El stock máximo debe ser mayor que el stock mínimo'
        });
      }
    }

    if (updateData.precioVenta && updateData.precioCompra) {
      if (updateData.precioVenta < updateData.precioCompra) {
        return res.status(400).json({
          msg: 'El precio de venta debe ser mayor o igual al precio de compra'
        });
      }
    }

    // Actualizar item
    updateData.doctorActualizador = doctorId;
    
    const itemActualizado = await Inventario.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Populate separado
    await itemActualizado.populate('doctorCreador', 'nombre apellido');
    await itemActualizado.populate('doctorActualizador', 'nombre apellido');

    res.json({
      msg: 'Item de inventario actualizado correctamente',
      item: itemActualizado
    });

  } catch (error) {
    console.error('Error al actualizar item de inventario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        msg: 'ID de item no válido'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        msg: 'Error de validación',
        errores
      });
    }
    
    res.status(500).json({
      msg: 'Error al actualizar item de inventario'
    });
  }
};

// Eliminar item de inventario
const eliminarItemInventario = async (req, res) => {
  try {
    const doctorId = req.doctorHeader._id;
    const { id } = req.params;

    // Verificar que el doctor esté aprobado
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.estado !== 'aprobado') {
      return res.status(403).json({
        msg: 'No tienes permisos para eliminar items de inventario'
      });
    }

    const item = await Inventario.findById(id);

    if (!item) {
      return res.status(404).json({
        msg: 'Item de inventario no encontrado'
      });
    }

    // Verificar que no tenga cantidad (solo se pueden eliminar items agotados)
    if (item.cantidad > 0) {
      return res.status(400).json({
        msg: 'No se puede eliminar un item que tiene existencia. Primero debe agotar el stock.'
      });
    }

    await Inventario.findByIdAndDelete(id);

    res.json({
      msg: 'Item de inventario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar item de inventario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        msg: 'ID de item no válido'
      });
    }
    
    res.status(500).json({
      msg: 'Error al eliminar item de inventario'
    });
  }
};

// Actualizar stock (descontar cuando se asigna medicamento)
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, motivo } = req.body;

    // Validar que se proporcione la cantidad
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        msg: 'La cantidad debe ser un número positivo'
      });
    }

    // Buscar el item de inventario
    const item = await Inventario.findById(id);

    if (!item) {
      return res.status(404).json({
        msg: 'Item de inventario no encontrado'
      });
    }

    // Verificar que haya suficiente stock
    if (item.cantidad < cantidad) {
      return res.status(400).json({
        msg: `Stock insuficiente. Stock actual: ${item.cantidad}, solicitado: ${cantidad}`
      });
    }

    // Calcular nueva cantidad
    const nuevaCantidad = item.cantidad - cantidad;

    // Actualizar item
    const itemActualizado = await Inventario.findByIdAndUpdate(
      id,
      {
        cantidad: nuevaCantidad,
        doctorActualizador: req.doctorHeader._id,
        observaciones: motivo 
          ? `${item.observaciones || ''}\n[Salida: ${cantidad} - ${motivo}]` 
          : `${item.observaciones || ''}\n[Salida: ${cantidad} - Asignación de medicamento]`
      },
      { new: true, runValidators: true }
    );

    res.json({
      msg: `Stock actualizado correctamente. Descontados: ${cantidad} unidades`,
      item: itemActualizado,
      stockAnterior: item.cantidad,
      stockActual: nuevaCantidad,
      cantidadDescontada: cantidad
    });

  } catch (error) {
    console.error('Error al actualizar stock:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'ID de item no válido' });
    }
    
    res.status(500).json({
      msg: 'Error al actualizar stock'
    });
  }
};

export {
  crearItemInventario,
  listarInventario,
  obtenerItemInventario,
  actualizarItemInventario,
  eliminarItemInventario,
  actualizarStock
};
