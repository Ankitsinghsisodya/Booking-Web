import { Achievement } from "../models/achievement.model.js";
import { UserAchievement } from "../models/userAchievement.model.js";

/**
 * Calculate and update user achievements based on their adventure sessions
 * This utility function can be called after sessions are booked or completed
 *
 * @param {String} userId - The user ID
 * @param {Array} adventureStats - Array of adventure stats with name and totalSessions
 * @returns {Object} Object containing the results of the achievement updates
 */
export const calculateUserAchievements = async (userId, adventureStats) => {
  if (!userId || !adventureStats || !Array.isArray(adventureStats)) {
    throw new Error("User ID and adventure stats are required");
  }

  const results = {
    updated: false,
    categories: [],
    newAchievements: [],
  };

  try {
    // Process each adventure category
    for (const stat of adventureStats) {
      const { name, totalSessions } = stat;

      if (!name || typeof totalSessions !== "number") {
        results.categories.push({
          category: name,
          error: "Invalid data format",
          updated: false,
        });
        continue;
      }

      // Find achievements for this category
      const achievements = await Achievement.find({
        category: name,
        isActive: true,
      }).sort({ requiredSessions: 1 });

      if (achievements.length === 0) {
        results.categories.push({
          category: name,
          message: "No achievements found for this category",
          updated: false,
        });
        continue;
      }

      const categoryResult = {
        category: name,
        updated: false,
        newAchievements: [],
      };

      // Process each achievement level
      for (const achievement of achievements) {
        if (totalSessions >= achievement.requiredSessions) {
          // Check if user already has this achievement
          const existingAchievement = await UserAchievement.findOne({
            user: userId,
            achievement: achievement._id,
            category: name,
          });

          if (!existingAchievement) {
            // Create new user achievement
            await UserAchievement.create({
              user: userId,
              achievement: achievement._id,
              category: name,
              isEarned: true,
              sessionsCompleted: totalSessions,
            });

            categoryResult.updated = true;
            categoryResult.newAchievements.push({
              title: achievement.title,
              description: achievement.description,
              level: achievement.level,
            });

            results.newAchievements.push({
              category: name,
              title: achievement.title,
              description: achievement.description,
              level: achievement.level,
            });
          }
        }
      }

      results.categories.push(categoryResult);
      if (categoryResult.updated) {
        results.updated = true;
      }
    }

    return results;
  } catch (error) {
    console.error("Error calculating user achievements:", error);
    throw error;
  }
};

/**
 * Get all achievements for a specific user, grouped by category
 *
 * @param {String} userId - The user ID
 * @returns {Array} Array of achievement categories with user's progress
 */
export const getUserAchievementsByCategory = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Get all achievements
    const allAchievements = await Achievement.find({ isActive: true }).sort({
      category: 1,
      level: 1,
    });

    // Get user's earned achievements
    const userAchievements = await UserAchievement.find({
      user: userId,
      isEarned: true,
    }).populate("achievement");

    // Create a map of earned achievements for quick lookup
    const earnedMap = userAchievements.reduce((acc, ua) => {
      if (!acc[ua.category]) {
        acc[ua.category] = {};
      }
      // Map by achievement ID
      if (ua.achievement) {
        acc[ua.category][ua.achievement._id.toString()] = true;
      }
      return acc;
    }, {});

    // Group all achievements by category
    const achievementsByCategory = allAchievements.reduce(
      (acc, achievement) => {
        if (!acc[achievement.category]) {
          acc[achievement.category] = [];
        }

        // Check if the user has earned this achievement
        const isEarned =
          earnedMap[achievement.category] &&
          earnedMap[achievement.category][achievement._id.toString()];

        acc[achievement.category].push({
          ...achievement.toObject(),
          isEarned: !!isEarned,
        });

        return acc;
      },
      {}
    );

    // Format data like the frontend structure
    const formattedAchievements = Object.keys(achievementsByCategory).map(
      (category) => ({
        category,
        achievements: achievementsByCategory[category],
      })
    );

    return formattedAchievements;
  } catch (error) {
    console.error("Error getting user achievements by category:", error);
    throw error;
  }
};
