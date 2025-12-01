// Back-Dental-Bosch/src/index.js

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import conectarDB from "./database.js"; // Si database.js está en src/
import doctorRoutes from "./routes/doctor-routes.js"; 
//import dotenv from "dotenv";
dotenv.config();

const servidor = express();

// Middlewares
servidor.use(cors());
servidor.use(express.json());

// Conectar a la base de datos
conectarDB();

// Rutas
servidor.use("/api/doctor", doctorRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 4000;
servidor.listen(PORT, () => {
  console.log(` Servidor corriendo en puerto ${PORT}`);
});


