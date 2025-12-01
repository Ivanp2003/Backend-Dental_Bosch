import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI_PRODUCTION
    );
    console.log(` MongoDB conectado: ${db.connection.host}`);
  } catch (error) {
    console.log(` Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default conectarDB;