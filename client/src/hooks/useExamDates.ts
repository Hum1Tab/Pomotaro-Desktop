import { useState, useEffect, useCallback } from 'react';

export interface ExamDate {
    id: string;
    name: string; // 試験名（例：「共通テスト」「○○大学二次試験」）
    date: string; // YYYY-MM-DD形式
    color: string; // 表示色
    createdAt: number;
}

const DEFAULT_EXAMS: ExamDate[] = [];

export function useExamDates() {
    const [exams, setExams] = useState<ExamDate[]>([]);

    // Load exams from localStorage on mount
    useEffect(() => {
        const savedExams = localStorage.getItem('examDates');
        if (savedExams) {
            try {
                setExams(JSON.parse(savedExams));
            } catch (error) {
                console.error('Failed to load exam dates:', error);
                setExams(DEFAULT_EXAMS);
            }
        } else {
            setExams(DEFAULT_EXAMS);
        }
    }, []);

    // Save exams to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('examDates', JSON.stringify(exams));
    }, [exams]);

    const addExam = useCallback((name: string, date: string, color: string) => {
        const newExam: ExamDate = {
            id: Date.now().toString(),
            name,
            date,
            color,
            createdAt: Date.now(),
        };
        setExams((prev) => [...prev, newExam]);
        return newExam;
    }, []);

    const updateExam = useCallback((id: string, updates: Partial<Omit<ExamDate, 'id' | 'createdAt'>>) => {
        setExams((prev) =>
            prev.map((exam) => (exam.id === id ? { ...exam, ...updates } : exam))
        );
    }, []);

    const deleteExam = useCallback((id: string) => {
        setExams((prev) => prev.filter((exam) => exam.id !== id));
    }, []);

    const getExamById = useCallback(
        (id: string) => {
            return exams.find((exam) => exam.id === id);
        },
        [exams]
    );

    // Get upcoming exams sorted by date
    const getUpcomingExams = useCallback(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return exams
            .filter((exam) => new Date(exam.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [exams]);

    // Calculate days until exam
    const getDaysUntil = useCallback((examDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exam = new Date(examDate);
        exam.setHours(0, 0, 0, 0);
        const diffTime = exam.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, []);

    return {
        exams,
        addExam,
        updateExam,
        deleteExam,
        getExamById,
        getUpcomingExams,
        getDaysUntil,
    };
}
