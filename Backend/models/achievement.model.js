import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    // Each achievement belongs to a category (e.g., "Skiing", "Snowshoe Hiking")
    category: {
      type: String,
      required: true,
      trim: true,
    },
    // Achievement title (e.g., "First Adventure", "Adventure Explorer")
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Achievement description (e.g., "First Descent", "Complete 10 Sessions")
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Achievement level (0 for basic, 1 for intermediate, 2 for advanced, 3 for expert)
    level: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 3,
    },
    // Number of sessions required to unlock this achievement
    requiredSessions: {
      type: Number,
      required: true,
      default: 1,
    },
    // Icon or image for the achievement badge (optional)
    icon: {
      type: String,
      default: "award", // Default icon is "award"
    },
    // Whether this achievement is active and available to users
    isActive: {
      type: Boolean,
      default: true,
    },
    // Timestamp for when the achievement was created
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Timestamp for when the achievement was last updated
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for category and title for faster lookups
achievementSchema.index({ category: 1, title: 1 }, { unique: true });

// Define standard achievement levels with their corresponding requiredSessions
achievementSchema.statics.ACHIEVEMENT_LEVELS = {
  FIRST_ADVENTURE: { level: 0, requiredSessions: 1 },
  ADVENTURE_EXPLORER: { level: 1, requiredSessions: 5 },
  ADVENTURE_MASTER: { level: 2, requiredSessions: 10 },
  ADVENTURE_LEGEND: { level: 3, requiredSessions: 20 },
};

// Static method to get all achievements by category
achievementSchema.statics.getByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ level: 1 });
};

// Static method to get all available categories
achievementSchema.statics.getAllCategories = function () {
  return this.distinct("category", { isActive: true });
};

// Export the Achievement model
export const Achievement = mongoose.model("Achievement", achievementSchema);
