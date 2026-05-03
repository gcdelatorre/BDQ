import api from "./api";

/**
 * CLINICAL SERVICE (Frontend)
 * Handles all clinical tracking data interactions
 * Consolidates pediatric and maternal health tracking
 */
const clinicalService = {
  // Child Immunization
  recordChildImmunization: async (data) => {
    const response = await api.post("/immunization/child", data);
    return response.data;
  },
  getChildImmunizationRecords: async (childId) => {
    const response = await api.get(`/immunization/child/${childId}`);
    return response.data.data;
  },

  // Maternal Immunization
  saveMaternalRecord: async (data) => {
    const response = await api.post("/maternal/td-dose", data);
    return response.data;
  },
  getMaternalRecord: async (childId) => {
    const response = await api.get(`/maternal/child/${childId}`);
    return response.data.data;
  },

  // Nutritional Assessment
  recordNutritionAssessment: async (data) => {
    const response = await api.post("/nutrition/record", data);
    return response.data;
  },
  getNutritionHistory: async (childId) => {
    const response = await api.get(`/nutrition/child/${childId}`);
    return response.data.data;
  },

  // Supplementation Record
  recordSupplement: async (data) => {
    const response = await api.post("/supplement/record", data);
    return response.data;
  },
  getSupplementHistory: async (childId) => {
    const response = await api.get(`/supplement/child/${childId}`);
    return response.data.data;
  },

  // Breastfeeding Checkpoint
  recordBreastfeeding: async (data) => {
    const response = await api.post("/breastfeeding/record", data);
    return response.data;
  },
  getBreastfeedingHistory: async (childId) => {
    const response = await api.get(`/breastfeeding/child/${childId}`);
    return response.data.data;
  }
};

export default clinicalService;
