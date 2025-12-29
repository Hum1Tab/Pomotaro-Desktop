import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function ShortcutsDialog() {
    const { t } = useLanguage();

    const shortcuts = [
        { key: 'Space', action: t('shortcuts.startPause') },
        { key: 'Ctrl + R', action: t('shortcuts.reset') },
        { key: '→', action: t('shortcuts.nextSession') },
        { key: '←', action: t('shortcuts.prevSession') },
        { key: 'Ctrl + S', action: t('shortcuts.toggleSettings') },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Keyboard className="w-4 h-4" />
                    {t('shortcuts.title')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('shortcuts.title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                            <span className="text-sm font-medium text-foreground">
                                {shortcut.action}
                            </span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
