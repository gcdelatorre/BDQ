import api from "./api";

/**
 * PHARMACY SERVICE (Frontend)
 * Handles medicine master list, inventory batches, and dispensing transactions
 */
const pharmacyService = {
  // Medicine Master List
  getAllMedicines: async () => {
    const response = await api.get("/medicine/all");
    return response.data.data;
  },

  addMedicine: async (data) => {
    const response = await api.post("/medicine/add-medicine", data);
    return response.data;
  },

  // Inventory & Batches
  addBatch: async (data) => {
    const response = await api.post("/medicine/add-batch", data);
    return response.data;
  },

  getInventoryHistory: async (medicineId) => {
    const response = await api.get(`/medicine/history/${medicineId}`);
    return response.data.data;
  },

  // Dispensing
  dispenseMedicine: async (data) => {
    const response = await api.post("/dispensing/new", data);
    return response.data;
  },

  getDispensingHistory: async (limit) => {
    const params = limit != null ? { limit } : {};
    const response = await api.get("/dispensing/history", { params });
    return response.data.data;
  },

  getDispensingCount: async () => {
    const response = await api.get("/dispensing/count");
    return response.data.data.total;
  },
  
  getHistoryByChild: async (childId) => {
    const response = await api.get(`/dispensing/history/${childId}`);
    return response.data.data;
  }
};

export default pharmacyService;
