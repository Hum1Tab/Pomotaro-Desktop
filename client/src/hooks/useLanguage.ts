import { useState, useEffect, useCallback } from 'react';

import { Language, translations } from '../locales/translations';

export function useLanguage() {
    const [language, setLanguage] = useState<Language>('ja'); // Default to Japanese as requested context implies it

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'ja')) {
            setLanguage(savedLang);
        } else {
            // Detect browser language if not saved
            const browserLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
            setLanguage(browserLang);
        }
    }, []);

    const changeLanguage = useCallback((lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app-language', lang);
    }, []);

    const t = useCallback((key: string): string => {
        return translations[language][key] || key;
    }, [language]);

    return { language, changeLanguage, t };
}
