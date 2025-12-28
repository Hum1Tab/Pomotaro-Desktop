import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AddTaskFormProps {
    onAddTask: (title: string, estimatedPomodoros: number) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAddTask(title.trim(), estimatedPomodoros);
            setTitle('');
            setEstimatedPomodoros(1);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder={t('tasks.placeholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 rounded-lg border-2 border-border focus:border-primary focus:ring-0 bg-background text-foreground"
                />
                <Input
                    type="number"
                    min="1"
                    max="20"
                    value={estimatedPomodoros}
                    onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
                    className="w-16 sm:w-20 rounded-lg border-2 border-border focus:border-primary focus:ring-0 bg-background text-foreground text-center"
                    title={t('tasks.estimated')}
                />
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
