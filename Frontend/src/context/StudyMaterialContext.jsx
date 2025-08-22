import React, { createContext, useContext, useState, useEffect } from 'react';
import studyMaterialService from '../services/studyMaterialService';

const StudyMaterialContext = createContext();

export const useStudyMaterial = () => useContext(StudyMaterialContext);

export const StudyMaterialProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState([
    { label: 'AI & ML', value: 'ai-ml' },
    { label: 'Web Development', value: 'web-dev' },
    { label: 'DSA', value: 'dsa' },
    { label: 'Programming', value: 'programming' },
    { label: 'Database', value: 'database' }
  ]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all study materials
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await studyMaterialService.getAllMaterials();
      setMaterials(response.data);
      setFilteredMaterials(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching study materials:', err);
      setError('Failed to load study materials. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch materials by category
  const fetchMaterialsByCategory = async (category) => {
    if (category === 'all') {
      return fetchMaterials();
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await studyMaterialService.getMaterialsByCategory(category);
      setFilteredMaterials(response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching ${category} materials:`, err);
      setError(`Failed to load ${category} materials. Please try again later.`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Filter materials by category (client-side)
  const filterByCategory = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(material => material.category === category);
      setFilteredMaterials(filtered);
    }
  };

  // Search materials
  const searchMaterials = (query) => {
    if (!query.trim()) {
      filterByCategory(activeCategory);
      return;
    }

    const filtered = materials.filter(material => {
      const matchesSearch = 
        material.title.toLowerCase().includes(query.toLowerCase()) ||
        material.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || material.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredMaterials(filtered);
  };

  // Download material
  const downloadMaterial = async (id) => {
    try {
      const response = await studyMaterialService.downloadMaterial(id);
      // In a real application, you would handle the file download here
      return response;
    } catch (err) {
      console.error('Error downloading material:', err);
      throw err;
    }
  };

  // Load materials on mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <StudyMaterialContext.Provider
      value={{
        materials,
        filteredMaterials,
        categories,
        activeCategory,
        isLoading,
        error,
        fetchMaterials,
        fetchMaterialsByCategory,
        filterByCategory,
        searchMaterials,
        downloadMaterial,
        setActiveCategory
      }}
    >
      {children}
    </StudyMaterialContext.Provider>
  );
};