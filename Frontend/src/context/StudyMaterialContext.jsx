import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl } from "../config/api";

const StudyMaterialContext = createContext();

export const useStudyMaterial = () => useContext(StudyMaterialContext);

export const StudyMaterialProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = getApiUrl("admin");
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/study-materials?limit=100`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch study materials");
      }

      const data = await response.json();
      const materialsData = data.data?.materials || [];

      setMaterials(materialsData);
      setFilteredMaterials(materialsData);

      const uniqueCategories = [
        ...new Set(materialsData.map((material) => material.subject)),
      ]
        .filter(Boolean)
        .map((subject) => ({ label: subject, value: subject }));

      setCategories(uniqueCategories);

      return materialsData;
    } catch (err) {
      console.error("Error fetching study materials:", err);
      setError("Failed to load study materials. Please try again later.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterialsByCategory = async (category) => {
    if (category === "all") {
      return fetchMaterials();
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/study-materials?subject=${category}&limit=100`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} materials`);
      }

      const data = await response.json();
      const materialsData = data.data?.materials || [];

      setFilteredMaterials(materialsData);
      return materialsData;
    } catch (err) {
      console.error(`Error fetching ${category} materials:`, err);
      setError(`Failed to load ${category} materials. Please try again later.`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const filterByCategory = (category) => {
    setActiveCategory(category);
    if (category === "all") {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(
        (material) => material.subject === category
      );
      setFilteredMaterials(filtered);
    }
  };

  const searchMaterials = (query) => {
    if (!query.trim()) {
      filterByCategory(activeCategory);
      return;
    }

    const filtered = materials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(query.toLowerCase()) ||
        material.description.toLowerCase().includes(query.toLowerCase()) ||
        (material.tags &&
          material.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          ));

      const matchesCategory =
        activeCategory === "all" || material.subject === activeCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredMaterials(filtered);
  };

  const downloadMaterial = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/study-materials/${id}/download`
      );

      if (!response.ok) {
        throw new Error("Failed to download material");
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `material-${id}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return response;
    } catch (err) {
      console.error("Error downloading material:", err);
      throw err;
    }
  };

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
        setActiveCategory,
      }}
    >
      {children}
    </StudyMaterialContext.Provider>
  );
};
