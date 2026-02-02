import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const inventarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: [
      'Medicamentos',
      'Material dental',
      'Instrumental',
      'Equipamiento',
      'Productos de higiene',
      'Anestesia',
      'Otros'
    ]
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  codigo: {
    type: String,
    required: [true, 'El código del producto es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'El código no puede exceder los 50 caracteres']
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [0, 'La cantidad no puede ser negativa'],
    default: 0
  },
  stockMinimo: {
    type: Number,
    required: [true, 'El stock mínimo es obligatorio'],
    min: [0, 'El stock mínimo no puede ser negativo'],
    default: 5
  },
  stockMaximo: {
    type: Number,
    required: [true, 'El stock máximo es obligatorio'],
    min: [1, 'El stock máximo debe ser mayor que 0'],
    default: 100
  },
  unidadMedida: {
    type: String,
    required: [true, 'La unidad de medida es obligatoria'],
    enum: [
      'Unidades',
      'Cajas',
      'Frascos',
      'Paquetes',
      'Kilogramos',
      'Litros',
      'Mililitros',
      'Gramos',
      'Otros'
    ],
    default: 'Unidades'
  },
  precioCompra: {
    type: Number,
    required: [true, 'El precio de compra es obligatorio'],
    min: [0, 'El precio de compra no puede ser negativo']
  },
  precioVenta: {
    type: Number,
    required: [true, 'El precio de venta es obligatorio'],
    min: [0, 'El precio de venta no puede ser negativo']
  },
  proveedor: {
    type: String,
    trim: true,
    maxlength: [100, 'El nombre del proveedor no puede exceder los 100 caracteres']
  },
  fechaCaducidad: {
    type: Date,
    validate: {
      validator: function(value) {
        // Solo validar si hay fecha de caducidad
        if (!value) return true;
        return value > new Date();
      },
      message: 'La fecha de caducidad debe ser futura'
    }
  },
  ubicacion: {
    type: String,
    trim: true,
    maxlength: [100, 'La ubicación no puede exceder los 100 caracteres']
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo', 'Agotado'],
    default: 'Activo'
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden exceder los 1000 caracteres']
  },
  doctorCreador: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorActualizador: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para mejorar el rendimiento
inventarioSchema.index({ categoria: 1 });
inventarioSchema.index({ estado: 1 });
inventarioSchema.index({ doctorCreador: 1 });

// Virtual para verificar si necesita reabastecimiento
inventarioSchema.virtual('necesitaReabastecimiento').get(function() {
  return this.cantidad <= this.stockMinimo;
});

// Virtual para verificar si está sobre stock
inventarioSchema.virtual('sobreStock').get(function() {
  return this.cantidad >= this.stockMaximo;
});

const Inventario = mongoose.model('Inventario', inventarioSchema);

export default Inventario;
