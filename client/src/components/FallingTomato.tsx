import React, { useEffect } from 'react';

interface FallingTomatoProps {
    id: number;
    onComplete: (id: number) => void;
}

export const FallingTomato: React.FC<FallingTomatoProps> = ({ id, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => onComplete(id), 1000);
        return () => clearTimeout(timer);
    }, [id, onComplete]);

    const left = Math.random() * 80 + 10; // Random position between 10% and 90%
    const rotate = Math.random() * 360;

    return (
        <div
            className="fixed top-0 z-[60] text-4xl animate-drop pointer-events-none select-none"
            style={{ left: `${left}%`, '--tw-rotate': `${rotate}deg` } as any}
        >
            🍅
        </div>
    );
};
