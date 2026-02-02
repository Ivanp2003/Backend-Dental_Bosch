# Backend - Consultorio Dental Bosch

API RESTful para la gestión de un consultorio dental con Node.js, Express, MongoDB y autenticación JWT.

## 🚀 Características

- ✅ Autenticación de Pacientes y Doctores
- ✅ Confirmación de cuenta por email
- ✅ Gestión de Citas Médicas
- ✅ Sistema de Inventario
- ✅ Recuperación de contraseña
- ✅ Google OAuth
- ✅ Upload de imágenes con Cloudinary
- ✅ Endpoints de prueba para desarrollo

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- MongoDB (local o en la nube)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Back-Dental-Bosch
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Luego edita el archivo `.env` con tus credenciales:
   - Configura la URI de MongoDB
   - Configura el SMTP para envío de correos
   - Configura las claves de Google OAuth
   - Configura Cloudinary si usarás imágenes

4. **Iniciar MongoDB**
   - Si usas MongoDB local, asegúrate de que esté corriendo en `localhost:27017`

5. **Ejecutar el servidor**
   ```bash
   npm run dev
   ```

El servidor se iniciará en `http://localhost:4000`

## 📁 Estructura del Proyecto

```
Back-Dental-Bosch/
├── src/
│   ├── controllers/     # Lógica de negocio
│   ├── models/         # Modelos de Mongoose
│   ├── routes/         # Definición de rutas
│   ├── middlewares/     # Middleware personalizados
│   ├── helpers/         # Funciones auxiliares
│   └── config/         # Configuraciones
├── .env                # Variables de entorno (no subir a git)
├── .env.example        # Plantilla de variables de entorno
├── .gitignore          # Archivos ignorados por git
├── package.json        # Dependencias del proyecto
└── README.md           # Este archivo
```

## 🔐 Endpoints de Autenticación

### Pacientes
- `POST /api/paciente/registro` - Registrar nuevo paciente
- `POST /api/paciente/login` - Iniciar sesión
- `GET /api/paciente/confirmar/:token` - Confirmar cuenta
- `GET /api/paciente/perfil` - Obtener perfil (requiere token)
- `PUT /api/paciente/perfil` - Actualizar perfil (requiere token)

### Doctores
- `POST /api/doctor/registro` - Registrar nuevo doctor
- `POST /api/doctor/login` - Iniciar sesión
- `GET /api/doctor/confirmar/:token` - Confirmar cuenta
- `POST /api/doctor/recuperarPassword` - Recuperar contraseña
- `GET /api/doctor/perfil` - Obtener perfil (requiere token)
- `PUT /api/doctor/actualizarperfil/:id` - Actualizar perfil (requiere token)

## 📅 Endpoints de Citas

- `GET /api/cita/doctor/prueba` - Listar citas del doctor (prueba)
- `GET /api/cita/prueba/:id` - Obtener cita específica (prueba)
- `PUT /api/cita/prueba/:id` - Actualizar cita (prueba)
- `DELETE /api/cita/prueba/:id` - Eliminar cita (prueba)
- `GET /api/cita/disponibles` - Obtener horarios disponibles

## 📦 Endpoints de Inventario

- `GET /api/inventario/` - Listar items (requiere token doctor)
- `POST /api/inventario/` - Crear item (requiere token doctor)
- `PUT /api/inventario/:id` - Actualizar item (requiere token doctor)
- `DELETE /api/inventario/:id` - Eliminar item (requiere token doctor)

## 🧪 Endpoints de Debug (Solo Desarrollo)

- `GET /api/paciente/debug/tokens` - Ver tokens de pacientes
- `GET /api/doctor/debug/tokens` - Ver tokens de doctores

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `4000` |
| `MONGODB_URI_LOCAL` | URI MongoDB local | `mongodb://localhost:27017/consultorio` |
| `JWT_SECRET` | Secreto para JWT | `TOKENSECRETO` |
| `USER_MAILTRAP` | Email para SMTP | `email@gmail.com` |
| `PASS_MAILTRAP` | Contraseña SMTP | `password` |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth | `xxx` |

## 📝 Notas Importantes

1. **No subir el archivo `.env`** a ningún repositorio git
2. **Usar contraseñas seguras** en producción
3. **Configurar correctamente** las URLs de frontend y backend
4. **Los endpoints de prueba** (`/prueba/*`) son solo para desarrollo
5. **Reiniciar el servidor** después de cambiar variables de entorno

## 🐛 Troubleshooting

### Error: "No tienes permisos para modificar esta cita"
- Usa los endpoints de prueba: `/api/cita/prueba/:id` en lugar de `/api/cita/:id`

### Error: "Token no válido"
- Verifica que el token no haya expirado
- Usa los endpoints de debug para obtener tokens válidos

### Error: "La cuenta no ha sido confirmada"
- Confirma la cuenta usando el enlace enviado por email
- O usa los endpoints de debug para obtener el token de confirmación

## 📄 Licencia

Este proyecto es propiedad de Consultorio Dental Bosch.

## 👥 Autores

- Backend desarrollado con Node.js y Express
- Base de datos MongoDB
- Autenticación JWT
