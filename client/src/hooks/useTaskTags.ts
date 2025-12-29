import { useState, useEffect, useCallback } from 'react';

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#E8644A', // Coral Red
  '#F5A76B', // Warm Orange
  '#8B9D83', // Sage Green
  '#D4B4A0', // Warm Taupe
  '#C9A88A', // Warm Brown
  '#7BA3A0', // Teal
  '#9B8B7E', // Warm Gray
];

export function useTaskTags() {
  const [tags, setTags] = useState<TaskTag[]>([]);

  // Load tags from localStorage on mount
  useEffect(() => {
    const savedTags = localStorage.getItem('pomodoroTags');
    if (savedTags) {
      try {
        setTags(JSON.parse(savedTags));
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    }
  }, []);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pomodoroTags', JSON.stringify(tags));
  }, [tags]);

  const addTag = useCallback((name: string, color?: string) => {
    // Limit name to 14 characters
    const limitedName = name.substring(0, 14);
    const selectedColor = color || DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length];

    const newTag: TaskTag = {
      id: Date.now().toString(),
      name: limitedName,
      color: selectedColor,
    };

    setTags((prev) => [...prev, newTag]);
    return newTag;
  }, [tags.length]);

  const updateTag = useCallback((id: string, updates: Partial<TaskTag>) => {
    setTags((prev) =>
      prev.map((tag) =>
        tag.id === id
          ? {
              ...tag,
              name: updates.name ? updates.name.substring(0, 14) : tag.name,
              color: updates.color || tag.color,
            }
          : tag
      )
    );
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  }, []);

  const getTagById = useCallback(
    (id: string) => {
      return tags.find((tag) => tag.id === id);
    },
    [tags]
  );

  return {
    tags,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
    defaultColors: DEFAULT_COLORS,
  };
}
