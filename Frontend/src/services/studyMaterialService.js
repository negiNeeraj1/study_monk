// src/services/studyMaterialService.js
import api from './api';

const studyMaterialService = {
  // Get all study materials
  getAllMaterials: async () => {
    try {
      const response = await api.get('/study-materials');
      return response.data;
    } catch (error) {
      console.error('Error fetching study materials:', error);
      throw error;
    }
  },

  // Get study materials by category
  getMaterialsByCategory: async (category) => {
    try {
      const response = await api.get(`/study-materials/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${category} study materials:`, error);
      throw error;
    }
  },

  // Get a single study material by ID
  getMaterialById: async (id) => {
    try {
      const response = await api.get(`/study-materials/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching study material details:', error);
      throw error;
    }
  },

  // Download a study material
  downloadMaterial: async (id) => {
    try {
      const response = await api.get(`/study-materials/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading study material:', error);
      throw error;
    }
  }
};

export default studyMaterialService;