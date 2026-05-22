import api from "./api";

/**
 * CLINICAL SERVICE (Frontend)
 * Handles all clinical tracking data interactions
 * Consolidates pediatric health tracking
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
  getVaccineRecallList: async () => {
    const response = await api.get("/immunization/recall");
    return response.data.data;
  },
  undoVaccineDose: async (recordId) => {
    const response = await api.delete(`/immunization/record/${recordId}`);
    return response.data;
  },
  changeVaccineDose: async (recordId, data) => {
    const response = await api.put(`/immunization/record/${recordId}`, data);
    return response.data;
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
  deleteNutritionAssessment: async (recordId) => {
    const response = await api.delete(`/nutrition/record/${recordId}`);
    return response.data;
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
  deleteSupplementRecord: async (recordId) => {
    const response = await api.delete(`/supplement/record/${recordId}`);
    return response.data;
  },

  // Breastfeeding Checkpoint
  recordBreastfeeding: async (data) => {
    const response = await api.post("/breastfeeding/record", data);
    return response.data;
  },
  getBreastfeedingHistory: async (childId) => {
    const response = await api.get(`/breastfeeding/child/${childId}`);
    return response.data.data;
  },
  deleteBreastfeedingRecord: async (recordId) => {
    const response = await api.delete(`/breastfeeding/record/${recordId}`);
    return response.data;
  },
  updateBreastfeedingRecord: async (recordId, data) => {
    const response = await api.put(`/breastfeeding/record/${recordId}`, data);
    return response.data;
  }
};

export default clinicalService;
