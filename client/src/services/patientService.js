import api from "./api";

const patientService = {
  /**
   * Fetches child patients from the system with optional search and pagination
   * @param {Object} options
   * @param {string} options.search
   * @param {number} options.page
   * @param {number} options.limit
   * @returns {Promise}
   */
  getAllPatients: async ({ search = "", page = 1, limit = 20 } = {}) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const response = await api.get("/patient/get-all-patient", { params });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  },

  /**
   * Registers a new child patient
   * @param {Object} patientData 
   * @returns {Promise}
   */
  registerChild: async (patientData) => {
    try {
      const response = await api.post("/patient/register-child", patientData);
      return response.data;
    } catch (error) {
      console.error("Error registering child:", error);
      throw error;
    }
  },

  /**
   * Fetches full profile data for a specific child
   * @param {number|string} id 
   * @returns {Promise}
   */
  getPatientById: async (id) => {
    try {
      // Assuming backend has a route like GET /api/patient/:id
      const response = await api.get(`/patient/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  }
};

export default patientService;
