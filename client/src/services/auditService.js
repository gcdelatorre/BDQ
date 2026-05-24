import api from "./api";

/**
 * AUDIT SERVICE (Frontend)
 * Handles fetching system activity logs
 */
const auditService = {
  getAllLogs: async (params = {}) => {
    const response = await api.get("/audit/get-all-logs", { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/audit/stats");
    return response.data.data;
  }
};

export default auditService;
