import express from "express";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  changeDocumentStatusById,
  deleteInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructorCommission,
} from "../controllers/instructor.controller.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/:id", getInstructorById);

// Protected routes - authentication required
router.use(verifyJWT);

// Route to get all instructors
router.get("/", getAllInstructors);
router.delete("/:id", deleteInstructor);
router.put("/:id", changeDocumentStatusById);
// Route to update instructor commission (admin only)
router.patch("/:instructorId/commission", isAdmin, updateInstructorCommission);

export default router;
