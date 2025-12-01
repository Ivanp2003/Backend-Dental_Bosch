# 🦷 Consultorio Dental – Backend

Backend desarrollado con Node.js, Express, MongoDB Atlas, JWT, bcryptjs, Nodemailer, Cloudinary, Stripe y Socket.io.
Este servidor gestiona usuarios, doctores, pacientes, citas, pagos, notificaciones y más.
-----


# 📌 Requisitos previos

Asegúrate de tener instalado:

Node.js v18 o superior

npm (incluido con Node)

Git

MongoDB Atlas (o Mongo Compass si deseas usar local)

Cuenta en Cloudinary (para carga de imágenes)

Cuenta en Stripe (si usas pagos)

# 📁 Clonar el proyecto
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# 📦 Instalar dependencias
npm install

# ⚙️ Configurar variables de entorno

Crea un archivo .env en la raíz del proyecto:

# ===========================================
#         CONFIGURACIÓN DEL SERVIDOR
# ===========================================
PORT=4000

# ===========================================
#         BASE DE DATOS MONGODB ATLAS
# ===========================================
MONGODB_URI_PRODUCTION="TU_URI_DE_ATLAS"

# Si deseas usar base de datos local en desarrollo:
# MONGODB_URI_LOCAL="mongodb://127.0.0.1:27017/nombreDB"

# ===========================================
# JWT - Tokens de autenticación
# ===========================================
JWT_SECRET="tu_clave_super_secreta"

# ===========================================
# CONFIG NODMAILER (para envío de correos)
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER="tuCorreo@gmail.com"
EMAIL_PASS="contraseñaAppGenerada"

# ===========================================
# CLOUDINARY (subida de imágenes)
# ===========================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# ===========================================
# STRIPE (pagos)
# ===========================================
STRIPE_SECRET_KEY=tu_clave_secreta

# ▶️ Ejecutar el servidor en modo desarrollo
npm run dev


📡 Endpoints principales (general)

## Auth

POST /api/auth/register

POST /api/auth/login

GET /api/auth/perfil

## Doctores

POST /api/doctor/registrar

GET /api/doctores

PUT /api/doctor/:id

## Pacientes

GET /api/pacientes

POST /api/paciente/registrar

## Citas

POST /api/cita

GET /api/citas
