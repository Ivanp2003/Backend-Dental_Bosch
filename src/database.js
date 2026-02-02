import mongoose from "mongoose"; // Librería ODM para conectar y trabajar con MongoDB

const conectarDB = async () => {
  try {
    console.log("🔍 Intentando conectar a MongoDB...");
    console.log("📍 URI Local:", process.env.MONGODB_URI_LOCAL);
    console.log("📍 URI Producción:", process.env.MONGODB_URI_PRODUCTION);
    
    // Intenta conectar a MongoDB usando la URI local o la de producción
    const db = await mongoose.connect(
      process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI_PRODUCTION
    );

    // Muestra en consola el host al que se conectó correctamente
    console.log(`✅ MongoDB conectado: ${db.connection.host}`);
    console.log(`📊 Base de datos: ${db.connection.name}`);
    
    // Verificar que la colección de inventarios exista
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📋 Colecciones disponibles:", collections.map(c => c.name));
    
    const inventarioExists = collections.some(c => c.name === 'inventarios');
    console.log("📦 Colección 'inventarios' existe:", inventarioExists);
    
  } catch (error) {
    // Muestra el error si falla la conexión
    console.log(`❌ Error al conectar a MongoDB: ${error.message}`);
    console.log("💡 Asegúrate de que MongoDB esté corriendo en localhost:27017");

    // Detiene la aplicación si no se puede conectar a la base de datos
    process.exit(1);
  }
};

export default conectarDB; // Exporta la función para usarla al iniciar el servidor
