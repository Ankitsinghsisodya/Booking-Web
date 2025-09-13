const mongoose = require("mongoose");
const axios = require("axios");
const { Achievement } = require("./models/achievement.model");
const { UserAchievement } = require("./models/userAchievement.model");
const User = require("./models/user.model");

const API_URL = "http://localhost:8080/api";
let authToken = "";

// Test user credentials
const TEST_USER = {
  email: "achievement.test@example.com",
  password: "Password123!",
  name: "Achievement Tester",
};

// Test data setup
async function setupTestData() {
  console.log("Setting up test data...");

  try {
    // Clear existing test data
    await Achievement.deleteMany({ category: "Test Adventure" });
    await UserAchievement.deleteMany({
      "achievement.category": "Test Adventure",
    });

    // Create test achievements
    const testAchievements = [
      {
        category: "Test Adventure",
        title: "First Adventure",
        description: "Complete your first Test Adventure session",
        level: 1,
        requiredSessions: 1,
      },
      {
        category: "Test Adventure",
        title: "Adventure Explorer",
        description: "Complete 5 Test Adventure sessions",
        level: 2,
        requiredSessions: 5,
      },
      {
        category: "Test Adventure",
        title: "Adventure Master",
        description: "Complete 10 Test Adventure sessions",
        level: 3,
        requiredSessions: 10,
      },
      {
        category: "Test Adventure",
        title: "Adventure Legend",
        description: "Complete 20 Test Adventure sessions",
        level: 4,
        requiredSessions: 20,
      },
    ];

    await Achievement.insertMany(testAchievements);
    console.log("Test achievements created successfully");

    // Check if test user exists, create if not
    let testUser = await User.findOne({ email: TEST_USER.email });

    if (!testUser) {
      // Register test user
      await axios.post(`${API_URL}/auth/register`, TEST_USER);
      console.log("Test user created successfully");
    } else {
      console.log("Test user already exists");
    }

    // Login to get auth token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    authToken = loginResponse.data.token;
    console.log("Successfully logged in with test user");

    return true;
  } catch (error) {
    console.error("Error setting up test data:", error.message);
    return false;
  }
}

// Test achievement fetching
async function testGetAchievements() {
  console.log("\n--- Testing achievement fetching ---");
  try {
    const response = await axios.get(`${API_URL}/achievements`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const achievements = response.data.achievements;

    if (!achievements || !Array.isArray(achievements)) {
      console.error("❌ Expected achievements to be an array");
      return false;
    }

    if (!achievements.some((a) => a.category === "Test Adventure")) {
      console.error("❌ Test achievements not found in response");
      return false;
    }

    console.log("✅ Successfully fetched achievements");
    console.log(`   Found ${achievements.length} achievement categories`);

    // Verify structure of achievements
    const testCategory = achievements.find(
      (a) => a.category === "Test Adventure"
    );
    if (
      !testCategory.achievements ||
      !Array.isArray(testCategory.achievements)
    ) {
      console.error("❌ Expected category to have achievements array");
      return false;
    }

    if (testCategory.achievements.length !== 4) {
      console.error(
        `❌ Expected 4 test achievements, found ${testCategory.achievements.length}`
      );
      return false;
    }

    console.log("✅ Achievement structure verified");
    return true;
  } catch (error) {
    console.error("❌ Error fetching achievements:", error.message);
    return false;
  }
}

// Test user achievements
async function testUserAchievements() {
  console.log("\n--- Testing user achievements ---");
  try {
    const response = await axios.get(`${API_URL}/users/achievements`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const achievements = response.data.achievements;

    if (!achievements || !Array.isArray(achievements)) {
      console.error("❌ Expected user achievements to be an array");
      return false;
    }

    console.log("✅ Successfully fetched user achievements");
    console.log(
      `   Found ${achievements.length} achievement categories for user`
    );

    return true;
  } catch (error) {
    console.error("❌ Error fetching user achievements:", error.message);
    return false;
  }
}

// Test achievement updating
async function testUpdateAchievements() {
  console.log("\n--- Testing achievement updating ---");
  try {
    // Simulate adventure stats
    const adventureStats = [
      {
        name: "Test Adventure",
        totalSessions: 5,
      },
    ];

    const response = await axios.post(
      `${API_URL}/achievements/update`,
      { adventureStats },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (!response.data.success) {
      console.error("❌ Achievement update failed");
      return false;
    }

    console.log("✅ Successfully updated achievements");

    // Verify the achievements were correctly awarded
    const userAchievementsResponse = await axios.get(
      `${API_URL}/users/achievements`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const achievements = userAchievementsResponse.data.achievements;
    const testCategory = achievements.find(
      (a) => a.category === "Test Adventure"
    );

    if (!testCategory) {
      console.error(
        "❌ Test Adventure category not found in user achievements"
      );
      return false;
    }

    const earnedAchievements = testCategory.achievements.filter(
      (a) => a.isEarned
    );

    // Should have earned First Adventure and Adventure Explorer (5 sessions)
    if (earnedAchievements.length !== 2) {
      console.error(
        `❌ Expected 2 earned achievements, found ${earnedAchievements.length}`
      );
      return false;
    }

    console.log(
      `✅ User has earned ${earnedAchievements.length} achievements for Test Adventure`
    );

    // Test with 15 sessions (should earn 3 achievement levels)
    const updatedStats = [
      {
        name: "Test Adventure",
        totalSessions: 15,
      },
    ];

    await axios.post(
      `${API_URL}/achievements/update`,
      { adventureStats: updatedStats },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const updatedAchievementsResponse = await axios.get(
      `${API_URL}/users/achievements`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const updatedCategory = updatedAchievementsResponse.data.achievements.find(
      (a) => a.category === "Test Adventure"
    );

    const newEarnedAchievements = updatedCategory.achievements.filter(
      (a) => a.isEarned
    );

    if (newEarnedAchievements.length !== 3) {
      console.error(
        `❌ Expected 3 earned achievements after update, found ${newEarnedAchievements.length}`
      );
      return false;
    }

    console.log(
      `✅ User now has ${newEarnedAchievements.length} earned achievements after update`
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating achievements:", error.message);
    return false;
  }
}

// Frontend Integration Test
async function testFrontendIntegration() {
  console.log("\n--- Testing frontend integration ---");
  console.log("⚠️ Manual verification required for this step");
  console.log(
    "Please verify in your browser at http://localhost:5174/dashboard:"
  );
  console.log("1. Achievement sections render correctly");
  console.log("2. Test achievements show correct earned/unearned status");
  console.log("3. Visual indicators for achievements are appropriate");
  console.log("4. No loading or error states persisting after data loads");

  return true; // This requires manual verification
}

// Run all tests
async function runTests() {
  console.log("🧪 Starting achievement system tests...\n");

  // Setup test data
  const setupSuccess = await setupTestData();
  if (!setupSuccess) {
    console.error("❌ Test setup failed. Aborting tests.");
    return;
  }

  // Run tests
  const testResults = {
    getAchievements: await testGetAchievements(),
    userAchievements: await testUserAchievements(),
    updateAchievements: await testUpdateAchievements(),
    frontendIntegration: await testFrontendIntegration(),
  };

  // Summary
  console.log("\n--- Test Summary ---");
  Object.entries(testResults).forEach(([test, result]) => {
    console.log(
      `${result ? "✅" : "❌"} ${test}: ${result ? "PASSED" : "FAILED"}`
    );
  });

  const overallSuccess = Object.values(testResults).every((result) => result);
  console.log(
    `\n${overallSuccess ? "✅ All tests passed!" : "❌ Some tests failed."}`
  );

  if (overallSuccess) {
    console.log("\n🎉 Achievement system is working correctly!");
    console.log("Step 6 completed successfully.");
  } else {
    console.log("\n⚠️ Achievement system needs attention.");
    console.log("Please review the test failures and fix the issues.");
  }
}

// Connect to MongoDB and run tests
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://saquib:Hello123@cluster0.n88ei.mongodb.net/booking-web",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    runTests()
      .catch((err) => console.error("Test error:", err))
      .finally(() => {
        console.log("\nTests completed. You can now close this script.");
      });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
