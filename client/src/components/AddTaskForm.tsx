import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AddTaskFormProps {
    onAddTask: (title: string, estimatedPomodoros: number) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAddTask(title.trim(), estimatedPomodoros);
            setTitle('');
            setEstimatedPomodoros(1);
            // Focus back to input for better accessibility
            inputRef.current?.focus();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={t('tasks.placeholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 rounded-lg border-2 border-border focus:border-primary focus:ring-0 bg-background text-foreground"
                />
                <div className="flex items-center bg-secondary/20 rounded-lg p-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setEstimatedPomodoros(Math.max(1, estimatedPomodoros - 1))}
                        className="h-8 w-8 rounded-md hover:bg-background/50 hover:text-primary transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </Button>
                    <div className="w-12 text-center">
                        <Input
                            ref={inputRef}
                            type="number"
                            min="1"
                            max="20"
                            value={estimatedPomodoros}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    setEstimatedPomodoros(Math.max(1, Math.min(20, val)));
                                }
                            }}
                            className="h-8 border-none bg-transparent text-center font-mono font-bold text-lg focus-visible:ring-0 px-0 [&::-webkit-inner-spin-button]:appearance-none"
                            title={t('tasks.estimated')}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setEstimatedPomodoros(Math.min(20, estimatedPomodoros + 1))}
                        className="h-8 w-8 rounded-md hover:bg-background/50 hover:text-primary transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                </div>
                <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
            <div className="text-xs text-muted-foreground">
                {t('tasks.enter')}
            </div>
        </form>
    );
}
