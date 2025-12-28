import { useState, useEffect, useCallback } from 'react';

export interface StudyCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

const DEFAULT_CATEGORIES: StudyCategory[] = [
  { id: '1', name: '数学', color: '#E8644A', icon: '🔢', createdAt: Date.now() },
  { id: '2', name: '英語', color: '#4A9EE8', icon: '🇬🇧', createdAt: Date.now() },
  { id: '3', name: '国語', color: '#8B9D83', icon: '📚', createdAt: Date.now() },
  { id: '4', name: '理科', color: '#9B59B6', icon: '🔬', createdAt: Date.now() },
  { id: '5', name: '社会', color: '#E67E22', icon: '🌍', createdAt: Date.now() },
  { id: '6', name: '古典', color: '#C9A88A', icon: '📖', createdAt: Date.now() },
];

export function useStudyCategories() {
  const [categories, setCategories] = useState<StudyCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('studyCategories');
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }

    // Load selected category from localStorage
    const savedSelectedId = localStorage.getItem('selectedCategoryId');
    if (savedSelectedId) {
      setSelectedCategoryId(savedSelectedId);
    }
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('studyCategories', JSON.stringify(categories));
    }
  }, [categories]);

  const addCategory = useCallback((name: string, color: string, icon: string) => {
    const newCategory: StudyCategory = {
      id: Date.now().toString(),
      name,
      color,
      icon,
      createdAt: Date.now(),
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<StudyCategory>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? {
            ...cat,
            ...updates,
          }
          : cat
      )
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    if (selectedCategoryId === id) {
      setSelectedCategoryId(categories[0]?.id || '1');
    }
  }, [selectedCategoryId, categories]);

  const getCategoryById = useCallback(
    (id: string) => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  const getSelectedCategory = useCallback(() => {
    return categories.find((cat) => cat.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const selectCategory = useCallback((id: string) => {
    setSelectedCategoryId(id);
    localStorage.setItem('selectedCategoryId', id);
  }, []);

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId: selectCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getSelectedCategory,
  };
}
