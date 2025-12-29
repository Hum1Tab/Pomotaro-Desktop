import { useState, useEffect, useCallback } from 'react';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  createdAt: number;
  tagId?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('pomodoroTasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(
    (title: string, estimatedPomodoros: number = 1) => {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        completed: false,
        estimatedPomodoros,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const getActiveTasks = useCallback(() => {
    return tasks.filter((task) => !task.completed);
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter((task) => task.completed);
  }, [tasks]);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getActiveTasks,
    getCompletedTasks,
    clearCompleted,
  };
}
