import { useTimerExtension } from '@/hooks/useTimerExtension';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface TimerExtensionProps {
  onExtendTime: (minutes: number) => void;
  currentTimeLeft: number;
}

export function TimerExtension({ onExtendTime, currentTimeLeft }: TimerExtensionProps) {
  const extension = useTimerExtension();

  const handleExtend = (minutes: number) => {
    onExtendTime(minutes * 60);
    extension.addExtension(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-foreground">Extend Timer</div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[1, 5, 10, 15].map((minutes) => (
          <Button
            key={minutes}
            onClick={() => handleExtend(minutes)}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm border-2 border-border text-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="w-3 h-3 mr-1" />
            +{minutes}m
          </Button>
        ))}
      </div>

      {extension.extensions.length > 0 && (
        <div className="space-y-2 p-3 rounded-lg bg-secondary/30">
          <div className="text-xs font-medium text-muted-foreground">
            Total Extensions: {formatTime(extension.getTotalExtensionTime())}
          </div>
          <div className="space-y-1">
            {extension.extensions.map((ext) => (
              <div
                key={ext.id}
                className="flex items-center justify-between text-xs p-2 rounded bg-secondary/50"
              >
                <span className="text-foreground">{formatTime(ext.duration)}</span>
                <Button
                  onClick={() => extension.removeExtension(ext.id)}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
