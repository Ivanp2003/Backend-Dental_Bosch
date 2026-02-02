import jwt from "jsonwebtoken";

const crearJWT = (id, rol = "doctor") => {
  return jwt.sign(
    { id, rol }, // Incluir rol en el payload
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export default crearJWT;
