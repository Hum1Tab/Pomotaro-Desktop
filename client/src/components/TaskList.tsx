import { Task } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface TaskListProps {
    tasks: Task[];
    onToggleComplete: (id: string) => void;
    onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onToggleComplete, onDeleteTask }: TaskListProps) {
    const { playClickSound, playSuccessSound } = useSound();

    const handleToggle = (id: string, completed: boolean) => {
        if (!completed) {
            playSuccessSound();
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#E8644A', '#F4A261', '#E9C46A'] // Custom colors matching theme
            });
        } else {
            playClickSound();
        }
        onToggleComplete(id);
    };

    const handleDelete = (id: string) => {
        playClickSound();
        onDeleteTask(id);
    };
    if (tasks.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No tasks yet. Add one to get started!
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all ${task.completed
                        ? 'bg-secondary/30 border-2 border-secondary'
                        : 'bg-secondary/50 border-2 border-border hover:border-primary'
                        }`}
                >
                    <div className="flex items-center gap-3 flex-1">
                        <button
                            onClick={() => handleToggle(task.id, task.completed)}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all ${task.completed
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-border hover:border-primary'
                                }`}
                        >
                            {task.completed && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                        <div className="flex-1">
                            <div
                                className={`text-sm sm:text-base font-medium ${task.completed
                                    ? 'text-muted-foreground line-through'
                                    : 'text-foreground'
                                    }`}
                            >
                                {task.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {task.estimatedPomodoros} pomodoro{task.estimatedPomodoros > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => handleDelete(task.id)}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive ml-2"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
