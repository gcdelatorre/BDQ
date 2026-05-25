import api from "./api";

const reportingService = {
  getMonthlySummary: async (month, year) => {
    const response = await api.get(`/reports/monthly-summary`, { params: { month, year } });
    return response.data.data;
  }
};

export default reportingService;
