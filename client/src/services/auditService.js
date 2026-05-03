import api from "./api";

/**
 * AUDIT SERVICE (Frontend)
 * Handles fetching system activity logs
 */
const auditService = {
  getAllLogs: async () => {
    const response = await api.get("/audit/get-all-logs");
    return response.data.data;
  }
};

export default auditService;
