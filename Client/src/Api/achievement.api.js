import { axiosClient } from '../AxiosClient/axios';

/**
 * Get all achievements available in the system
 * @param {Object} params - Optional query parameters
 * @param {string} params.category - Filter achievements by category
 * @returns {Promise<Object>} Response with all achievements grouped by category
 */
export const getAllAchievements = async (params = {}) => {
  try {
    const { data } = await axiosClient.get('/api/achievements', { params });
    return data;
  } catch (error) {
    console.error(
      'Failed to fetch achievements:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get all achievement categories
 * @returns {Promise<Object>} Response with all achievement categories
 */
export const getAchievementCategories = async () => {
  try {
    const { data } = await axiosClient.get('/api/achievements/categories');
    return data;
  } catch (error) {
    console.error(
      'Failed to fetch achievement categories:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get achievements for the currently authenticated user
 * @returns {Promise<Object>} Response with user's achievements
 */
export const getUserAchievements = async () => {
  try {
    const { data } = await axiosClient.get('/api/achievements/user');
    return data;
  } catch (error) {
    console.error(
      'Failed to fetch user achievements:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update user achievements based on adventure statistics
 * @param {Array} adventureStats - Array of adventure stats with name and totalSessions
 * @returns {Promise<Object>} Response with update results
 */
export const updateUserAchievements = async (adventureStats) => {
  try {
    const { data } = await axiosClient.post('/api/achievements/update', {
      adventureStats,
    });
    return data;
  } catch (error) {
    console.error(
      'Failed to update user achievements:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Admin: Add a new achievement
 * @param {Object} achievementData - Achievement data to add
 * @returns {Promise<Object>} Response with the created achievement
 */
export const addAchievement = async (achievementData) => {
  try {
    const { data } = await axiosClient.post(
      '/api/achievements',
      achievementData
    );
    return data;
  } catch (error) {
    console.error(
      'Failed to add achievement:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Admin: Update an existing achievement
 * @param {string} id - Achievement ID
 * @param {Object} achievementData - Updated achievement data
 * @returns {Promise<Object>} Response with the updated achievement
 */
export const updateAchievement = async (id, achievementData) => {
  try {
    const { data } = await axiosClient.put(
      `/api/achievements/${id}`,
      achievementData
    );
    return data;
  } catch (error) {
    console.error(
      'Failed to update achievement:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Admin: Delete an achievement
 * @param {string} id - Achievement ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteAchievement = async (id) => {
  try {
    const { data } = await axiosClient.delete(`/api/achievements/${id}`);
    return data;
  } catch (error) {
    console.error(
      'Failed to delete achievement:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Admin: Seed achievements from predefined data
 * @returns {Promise<Object>} Response with seeding results
 */
export const seedAchievements = async () => {
  try {
    const { data } = await axiosClient.post('/api/achievements/seed');
    return data;
  } catch (error) {
    console.error(
      'Failed to seed achievements:',
      error.response?.data || error.message
    );
    throw error;
  }
};
