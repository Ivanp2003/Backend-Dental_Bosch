// Back-Dental-Bosch/src/index.js
import dotenv from "dotenv";
dotenv.config();// Cargar las variables de entorno
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";
import session from "express-session";
import passport from "passport";
import initPassport from "./config/passport.js";

import conectarDB from "./database.js";
import doctorRoutes from "./routes/doctor-routes.js";
import pacienteRoutes from "./routes/paciente-routes.js";
import citaRoutes from "./routes/cita-routes.js";
import authRoutes from "./routes/auth-routes.js";
import inventarioRoutes from "./routes/inventario-routes.js";

// Inicializar Passport después de cargar variables de entorno
initPassport();


const servidor = express();

// CONFIGURACIONES
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MIDDLEWARES
const allowedOrigins = [
  process.env.URL_FRONTEND || 'http://localhost:5174',
  'http://localhost:5174',
  'https://front-dental-bosch.vercel.app',
  // Allow all Vercel preview subdomains
  /^https:\/\/front-dental-bosch-.*\.vercel\.app$/
];

servidor.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
servidor.use(bodyParser.json());
servidor.use(bodyParser.urlencoded({ extended: true }));

// Middleware para archivos (desactivado temporalmente)
// servidor.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "./uploads",
//   })
// );

// Configurar sesiones para Passport
servidor.use(session({
  secret: process.env.JWT_SECRET || 'secreto-temporal',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // En producción usar true con HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
servidor.use(passport.initialize());
servidor.use(passport.session());

servidor.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  })
);

// BASE DE DATOS
conectarDB();

// RUTAS
servidor.use("/api/doctor", doctorRoutes);
servidor.use("/api/paciente", pacienteRoutes);
servidor.use("/api/cita", citaRoutes);
servidor.use("/api/auth", authRoutes);
servidor.use("/api/inventario", inventarioRoutes);

// RUTA TEST
servidor.get("/", (req, res) => {
  res.send("🔥 API Dental Bosch funcionando");
});

// 404
servidor.use((req, res) => {
  res.status(404).json({ msg: "Endpoint no encontrado" });
});

// SERVER
const PORT = process.env.PORT || 4000;
servidor.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
