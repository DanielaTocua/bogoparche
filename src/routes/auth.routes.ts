import express from "express";

import AuthController from "../controllers/auth.controller";
import asyncErrorMiddleware from "../middlewares/asyncError.middleware";

const router = express.Router();
// Routes for database
// Configurar rutas

router.post("/login", asyncErrorMiddleware(loginController.loginUser));

export default router;
