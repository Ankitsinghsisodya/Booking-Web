import express from "express";
import {
  addAchievement,
  deleteAchievement,
  getAchievementCategories,
  getAllAchievements,
  getUserAchievements,
  seedAchievements,
  updateAchievement,
  updateUserAchievements,
} from "../controllers/achievement.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllAchievements);
router.get("/categories", getAchievementCategories);

// User authenticated routes
router.get("/user", verifyJWT, getUserAchievements);
router.post("/update", verifyJWT, updateUserAchievements);

// Admin routes
router.post("/", verifyJWT, verifyAdmin, addAchievement);
router.put("/:id", verifyJWT, verifyAdmin, updateAchievement);
router.delete("/:id", verifyJWT, verifyAdmin, deleteAchievement);
router.post("/seed", verifyJWT, verifyAdmin, seedAchievements);

export default router;
