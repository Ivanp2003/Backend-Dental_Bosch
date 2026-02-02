// Requerir módulos
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routerDoctores from './routers/doctor-routes.js';
import routerPacientes from './routers/paciente-routes.js';
import cloudinary from 'cloudinary';
import fileUpload from "express-fileupload";

// Inicializaciones
const servidor = express();
dotenv.config();

// Configuraciones
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middlewares
servidor.use(express.json());
servidor.use(cors());

servidor.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads' // Usa archivos temporales
}));

// Variables globales
servidor.set('port', process.env.PORT || 3000);

// Ruta principal
servidor.get('/', (req, res) => res.send("Server on"));

// Rutas para doctores
servidor.use('/api', routerDoctores);

// Rutas para pacientes
servidor.use('/api', routerPacientes);

// Manejo de una ruta que no sea encontrada
servidor.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"));

// Exportar la instancia de express por medio de servidor
export default servidor;