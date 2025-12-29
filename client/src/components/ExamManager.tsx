import { useState } from 'react';
import { useExamDates, ExamDate } from '@/hooks/useExamDates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const COLOR_OPTIONS = [
    '#E8644A', // 赤
    '#4A9EE8', // 青
    '#9B59B6', // 紫
    '#E67E22', // オレンジ
    '#16A085', // ターコイズ
    '#F39C12', // 黄色
];

export function ExamManager() {
    const { t, language } = useLanguage();
    const { exams, addExam, updateExam, deleteExam, getDaysUntil } = useExamDates();

    const [newExamName, setNewExamName] = useState('');
    const [newExamDate, setNewExamDate] = useState('');
    const [newExamColor, setNewExamColor] = useState(COLOR_OPTIONS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editColor, setEditColor] = useState('');

    const handleAddExam = () => {
        if (newExamName.trim() && newExamDate) {
            addExam(newExamName.trim(), newExamDate, newExamColor);
            setNewExamName('');
            setNewExamDate('');
            setNewExamColor(COLOR_OPTIONS[0]);
        }
    };

    const startEditing = (exam: ExamDate) => {
        setEditingId(exam.id);
        setEditName(exam.name);
        setEditDate(exam.date);
        setEditColor(exam.color);
    };

    const saveEdit = () => {
        if (editingId && editName.trim() && editDate) {
            updateExam(editingId, {
                name: editName.trim(),
                date: editDate,
                color: editColor,
            });
            setEditingId(null);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    // Sort exams by date
    const sortedExams = [...exams].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-warm">
                <h2 className="text-lg font-semibold text-foreground mb-4">{t('exams.addTitle')}</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                            {t('exams.name')}
                        </label>
                        <Input
                            type="text"
                            placeholder={t('exams.placeholder')}
                            value={newExamName}
                            onChange={(e) => setNewExamName(e.target.value)}
                            className="rounded-lg border-2 border-border focus:border-primary focus:ring-0"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                            {t('exams.date')}
                        </label>
                        <Input
                            type="date"
                            value={newExamDate}
                            onChange={(e) => setNewExamDate(e.target.value)}
                            className="rounded-lg border-2 border-border focus:border-primary focus:ring-0"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                            {t('exams.color')}
                        </label>
                        <div className="flex gap-2">
                            {COLOR_OPTIONS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setNewExamColor(color)}
                                    className={`w-10 h-10 rounded-lg transition-all ${newExamColor === color
                                        ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                                        : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleAddExam}
                        disabled={!newExamName.trim() || !newExamDate}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('exams.add')}
                    </Button>
                </div>
            </div>

            {sortedExams.length > 0 && (
                <div className="bg-card rounded-lg p-6 shadow-warm">
                    <h2 className="text-lg font-semibold text-foreground mb-4">{t('exams.registered')}</h2>

                    <div className="space-y-3">
                        {sortedExams.map((exam) => {
                            const daysUntil = getDaysUntil(exam.date);
                            const isEditing = editingId === exam.id;

                            return (
                                <div
                                    key={exam.id}
                                    className="p-4 rounded-lg border-2 border-border"
                                    style={{ borderColor: exam.color }}
                                >
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <Input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="rounded-lg border-2 border-border"
                                            />
                                            <Input
                                                type="date"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                                className="rounded-lg border-2 border-border"
                                            />
                                            <div className="flex gap-2">
                                                {COLOR_OPTIONS.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setEditColor(color)}
                                                        className={`w-8 h-8 rounded transition-all ${editColor === color
                                                            ? 'ring-2 ring-foreground scale-110'
                                                            : 'hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={saveEdit}
                                                    className="flex-1 bg-primary hover:bg-primary/90"
                                                    size="sm"
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    {t('settings.save')}
                                                </Button>
                                                <Button
                                                    onClick={cancelEdit}
                                                    variant="outline"
                                                    className="flex-1"
                                                    size="sm"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    {t('settings.cancel')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-foreground">{exam.name}</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {new Date(exam.date).toLocaleDateString('ja-JP', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        weekday: 'short'
                                                    })}
                                                </div>
                                                <div
                                                    className="text-sm font-medium mt-1"
                                                    style={{ color: exam.color }}
                                                >
                                                    {daysUntil === 0
                                                        ? t('exams.today')
                                                        : daysUntil > 0
                                                            ? (language === 'ja'
                                                                ? t('exams.daysLeft').replace('{days}', daysUntil.toString())
                                                                : `${daysUntil} ${t('exams.daysLeft')}`)
                                                            : (language === 'ja'
                                                                ? t('exams.daysPast').replace('{days}', Math.abs(daysUntil).toString())
                                                                : `${Math.abs(daysUntil)} ${t('exams.daysPast')}`)
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => startEditing(exam)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => deleteExam(exam.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {sortedExams.length === 0 && (
                <div className="bg-card rounded-lg p-8 text-center shadow-warm">
                    <p className="text-muted-foreground">
                        {t('exams.noExams')}<br />
                        {t('exams.addPrompt')}
                    </p>
                </div>
            )}
        </div>
    );
}
