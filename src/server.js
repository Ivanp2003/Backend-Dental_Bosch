import express from "express";
import cors from "cors";

const servidor = express();

servidor.use(cors());
servidor.use(express.json());

export default servidor;