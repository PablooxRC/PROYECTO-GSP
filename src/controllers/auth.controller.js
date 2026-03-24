import { pool } from "../db.js";
import bcrypt from "bcrypt";
import { createAccessToken } from "../libs/jwt.js";
import md5 from "md5";
import {
  asyncHandler,
  AuthenticationError,
  ConflictError,
} from "../utils/errorHandler.js";
import { sendSuccess } from "../utils/response.js";
import { queryOne } from "../utils/dbHelpers.js";

//acceder
export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("[SIGNIN] Intento de login:", {
    email,
    passwordProvided: !!password,
  });

  // Buscar primero en perfiles (usuarios auto-registrados)
  let user = await queryOne(
    pool,
    "SELECT *, 'perfil' AS source FROM perfiles WHERE email = $1",
    [email],
  );

  // Si no está en perfiles, buscar en dirigente
  if (!user) {
    user = await queryOne(
      pool,
      "SELECT *, 'dirigente' AS source FROM dirigente WHERE email = $1",
      [email],
    );
  }

  if (!user) {
    console.log("[SIGNIN] Usuario no encontrado:", email);
    throw new AuthenticationError("Datos incorrectos o usuario inexistente");
  }

  console.log("[SIGNIN] Usuario encontrado:", {
    ci: user.ci,
    email: user.email,
    source: user.source,
  });

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    console.log("[SIGNIN] Contraseña inválida para:", email);
    throw new AuthenticationError("La contraseña es incorrecta");
  }

  console.log("[SIGNIN] Login exitoso para:", email);
  const token = await createAccessToken({
    ci: user.ci,
    unidad: user.unidad,
    is_admin: user.is_admin || false,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  sendSuccess(res, user, "Sesión iniciada correctamente");
});

//Registrar perfil de usuario
export const signup = asyncHandler(async (req, res, next) => {
  const { email, password, unidad } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const scoutImages = [
    "https://cdn.pixabay.com/photo/2024/02/15/14/20/ai-generated-8575506_1280.png",
    "https://cdn.pixabay.com/photo/2016/03/31/17/54/hat-1293993_1280.png",
    "https://cdn.pixabay.com/photo/2016/11/22/12/24/camp-1849133_1280.png",
  ];

  const randomImageUrl =
    scoutImages[Math.floor(Math.random() * scoutImages.length)];

  try {
    const tempCi = `P${Math.random().toString(36).substr(2, 14)}`;

    const user = await queryOne(
      pool,
      "INSERT INTO perfiles(ci, email, password, unidad, gravatar) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [tempCi, email, hashedPassword, unidad, randomImageUrl],
    );

    const token = await createAccessToken({
      ci: user.ci,
      unidad: user.unidad,
      is_admin: false,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    sendSuccess(res, user, "Cuenta creada correctamente", 201);
  } catch (error) {
    if (error.code == "23505") {
      throw new ConflictError("El email ya está registrado");
    }
    throw error;
  }
});

//cerrar sesión
export const signout = asyncHandler((req, res) => {
  res.clearCookie("token");
  sendSuccess(res, null, "Sesión cerrada correctamente");
});

//acceder al perfil
export const profile = asyncHandler(async (req, res) => {
  // Buscar primero en perfiles, luego en dirigente
  let user = await queryOne(pool, "SELECT * FROM perfiles WHERE ci = $1", [
    req.userCI,
  ]);
  if (!user) {
    user = await queryOne(pool, "SELECT * FROM dirigente WHERE ci = $1", [
      req.userCI,
    ]);
  }
  sendSuccess(res, user, "Perfil obtenido");
});
