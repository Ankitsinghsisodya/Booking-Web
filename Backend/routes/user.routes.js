import express from "express";
import {
  deleteUser,
  getMe,
  getUser,
  getUserAchievements,
  getUserAdventure,
  getUserAdventureExperiences,
  getUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyJWT, getMe);
router.get("/profile", verifyJWT, getUser);
router.get("/adventure-experiences", verifyJWT, getUserAdventureExperiences);
router.get("/adventure", verifyJWT, getUserAdventure);
router.get("/achievements", verifyJWT, getUserAchievements);
router.get("/", verifyJWT, getUsers);
router.delete("/:id", verifyJWT, deleteUser);

export default router;
