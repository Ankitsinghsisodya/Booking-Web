import mongoose from "mongoose";
import { Achievement } from "../models/achievement.model.js";
import { UserAchievement } from "../models/userAchievement.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @description Get all achievements
 * @route GET /api/achievements
 * @access Public
 */
export const getAllAchievements = asyncHandler(async (req, res) => {
  const { category } = req.query;

  // Create query object
  const query = { isActive: true };
  if (category) {
    query.category = category;
  }

  const achievements = await Achievement.find(query).sort({
    category: 1,
    level: 1,
  });

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  // Format data like the frontend structure
  const formattedAchievements = Object.keys(achievementsByCategory).map(
    (category) => ({
      category,
      achievements: achievementsByCategory[category],
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { achievements: formattedAchievements },
        "Achievements fetched successfully"
      )
    );
});

/**
 * @description Get all achievement categories
 * @route GET /api/achievements/categories
 * @access Public
 */
export const getAchievementCategories = asyncHandler(async (req, res) => {
  const categories = await Achievement.getAllCategories();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { categories },
        "Achievement categories fetched successfully"
      )
    );
});

/**
 * @description Get achievements for a specific user
 * @route GET /api/achievements/user
 * @access Private
 */
export const getUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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
  const achievementsByCategory = allAchievements.reduce((acc, achievement) => {
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
  }, {});

  // Format data like the frontend structure
  const formattedAchievements = Object.keys(achievementsByCategory).map(
    (category) => ({
      category,
      achievements: achievementsByCategory[category],
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { achievements: formattedAchievements },
        "User achievements fetched successfully"
      )
    );
});

/**
 * @description Update user achievements based on sessions
 * @route POST /api/achievements/update
 * @access Private
 */
export const updateUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { adventureStats } = req.body;

  if (!adventureStats || !Array.isArray(adventureStats)) {
    throw new ApiError(400, "Adventure stats are required");
  }

  // Process each adventure category
  const results = await Promise.all(
    adventureStats.map(async (stat) => {
      const { name, totalSessions } = stat;

      if (!name || typeof totalSessions !== "number") {
        return { category: name, error: "Invalid data format" };
      }

      // Find achievements for this category
      const achievements = await Achievement.find({
        category: name,
        isActive: true,
      }).sort({ level: 1 });

      if (achievements.length === 0) {
        return {
          category: name,
          message: "No achievements found for this category",
          updated: false,
        };
      }

      // Process each achievement level
      const earnedAchievements = [];

      for (const achievement of achievements) {
        if (totalSessions >= achievement.requiredSessions) {
          // Try to find existing user achievement
          let userAchievement = await UserAchievement.findOne({
            user: userId,
            achievement: achievement._id,
            category: name,
          });

          // If not found, create a new one
          if (!userAchievement) {
            userAchievement = await UserAchievement.create({
              user: userId,
              achievement: achievement._id,
              category: name,
              isEarned: true,
              sessionsCompleted: totalSessions,
            });
            earnedAchievements.push(achievement.title);
          }
        }
      }

      return {
        category: name,
        updated: true,
        earnedAchievements,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { results },
        "User achievements updated successfully"
      )
    );
});

/**
 * @description Add a new achievement (admin only)
 * @route POST /api/achievements
 * @access Admin
 */
export const addAchievement = asyncHandler(async (req, res) => {
  const { category, title, description, level, requiredSessions, icon } =
    req.body;

  if (
    !category ||
    !title ||
    !description ||
    level === undefined ||
    requiredSessions === undefined
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if achievement already exists
  const existingAchievement = await Achievement.findOne({ category, title });
  if (existingAchievement) {
    throw new ApiError(
      400,
      "Achievement with this title already exists in this category"
    );
  }

  // Create new achievement
  const achievement = await Achievement.create({
    category,
    title,
    description,
    level,
    requiredSessions,
    icon: icon || "award",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { achievement }, "Achievement created successfully")
    );
});

/**
 * @description Update an achievement (admin only)
 * @route PUT /api/achievements/:id
 * @access Admin
 */
export const updateAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid achievement ID");
  }

  const achievement = await Achievement.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true }
  );

  if (!achievement) {
    throw new ApiError(404, "Achievement not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { achievement }, "Achievement updated successfully")
    );
});

/**
 * @description Delete an achievement (admin only)
 * @route DELETE /api/achievements/:id
 * @access Admin
 */
export const deleteAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid achievement ID");
  }

  const achievement = await Achievement.findByIdAndDelete(id);

  if (!achievement) {
    throw new ApiError(404, "Achievement not found");
  }

  // Also delete all user achievements for this achievement
  await UserAchievement.deleteMany({ achievement: id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Achievement deleted successfully"));
});

/**
 * @description Seed achievements from frontend data
 * @route POST /api/achievements/seed
 * @access Admin
 */
export const seedAchievements = asyncHandler(async (req, res) => {
  // This is a utility function to seed the database with the hardcoded frontend achievement data
  const achievementData = [
    {
      category: "Skiing",
      achievements: [
        {
          title: "First Adventure",
          description: "First Descent",
          level: 0,
          requiredSessions: 1,
        },
        {
          title: "Adventure Explorer",
          description: "Complete 10 Sessions",
          level: 1,
          requiredSessions: 5,
        },
        {
          title: "Adventure Master",
          description: "Master a Difficult Slope",
          level: 2,
          requiredSessions: 10,
        },
        {
          title: "Adventure Legend",
          description: "Season Rider (20+ sessions)",
          level: 3,
          requiredSessions: 20,
        },
      ],
    },
    {
      category: "Snowshoe Hiking",
      achievements: [
        {
          title: "First Adventure",
          description: "First Hike",
          level: 0,
          requiredSessions: 1,
        },
        {
          title: "Adventure Explorer",
          description: "Complete 5 Winter Hikes",
          level: 1,
          requiredSessions: 5,
        },
        {
          title: "Adventure Master",
          description: "Conquer a Tough Trail",
          level: 2,
          requiredSessions: 10,
        },
        {
          title: "Adventure Legend",
          description: "Winter Challenge Explorer",
          level: 3,
          requiredSessions: 20,
        },
      ],
    },
    {
      category: "Ski Touring",
      achievements: [
        {
          title: "First Adventure",
          description: "First Tour",
          level: 0,
          requiredSessions: 1,
        },
        {
          title: "Adventure Explorer",
          description: "Complete 10 Tours",
          level: 1,
          requiredSessions: 5,
        },
        {
          title: "Adventure Master",
          description: "Reach a High Peak",
          level: 2,
          requiredSessions: 10,
        },
        {
          title: "Adventure Legend",
          description: "Conquer a Technical Route",
          level: 3,
          requiredSessions: 20,
        },
      ],
    },
    {
      category: "Mountain Biking",
      achievements: [
        {
          title: "First Adventure",
          description: "First Ride",
          level: 0,
          requiredSessions: 1,
        },
        {
          title: "Adventure Explorer",
          description: "Complete 10 Rides",
          level: 1,
          requiredSessions: 5,
        },
        {
          title: "Adventure Master",
          description: "Master a Technical Trail",
          level: 2,
          requiredSessions: 10,
        },
        {
          title: "Adventure Legend",
          description: "Longest Distance Rider",
          level: 3,
          requiredSessions: 20,
        },
      ],
    },
    {
      category: "Mountain Hiking",
      achievements: [
        {
          title: "First Adventure",
          description: "First Hike",
          level: 0,
          requiredSessions: 1,
        },
        {
          title: "Adventure Explorer",
          description: "Complete 5 Hikes",
          level: 1,
          requiredSessions: 5,
        },
        {
          title: "Adventure Master",
          description: "Conquer a Challenging Route",
          level: 2,
          requiredSessions: 10,
        },
        {
          title: "Adventure Legend",
          description: "Weekend Expedition Finisher",
          level: 3,
          requiredSessions: 20,
        },
      ],
    },
    // Add more categories here as needed
  ];

  let created = 0;
  let skipped = 0;

  for (const category of achievementData) {
    for (const item of category.achievements) {
      // Check if achievement already exists
      const existing = await Achievement.findOne({
        category: category.category,
        title: item.title,
      });

      if (!existing) {
        await Achievement.create({
          category: category.category,
          title: item.title,
          description: item.description,
          level: item.level,
          requiredSessions: item.requiredSessions,
        });
        created++;
      } else {
        skipped++;
      }
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { created, skipped },
        "Achievements seeded successfully"
      )
    );
});
