import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    // Reference to the user who earned the achievement
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to the achievement that was earned
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    // The category of the achievement (for faster querying)
    category: {
      type: String,
      required: true,
      trim: true,
    },
    // Whether the achievement has been earned
    isEarned: {
      type: Boolean,
      default: true,
    },
    // Date when the achievement was earned
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    // Number of sessions completed in this category when the achievement was earned
    sessionsCompleted: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for user and achievement to ensure uniqueness
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

// Create an index for user and category for faster queries
userAchievementSchema.index({ user: 1, category: 1 });

// Static method to get all achievements for a specific user
userAchievementSchema.statics.getUserAchievements = function (userId) {
  return this.find({ user: userId, isEarned: true })
    .populate("achievement")
    .sort({ earnedAt: -1 });
};

// Static method to get achievements by category for a user
userAchievementSchema.statics.getUserAchievementsByCategory = function (
  userId,
  category
) {
  return this.find({ user: userId, category, isEarned: true })
    .populate("achievement")
    .sort({ "achievement.level": 1 });
};

// Export the UserAchievement model
export const UserAchievement = mongoose.model(
  "UserAchievement",
  userAchievementSchema
);
