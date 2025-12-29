import { useState } from 'react';
import { useStudyCategories, StudyCategory } from '@/hooks/useStudyCategories';
import { useLanguage } from '@/hooks/useLanguage';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface CategorySelectionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function CategorySelectionDialog({
    open,
    onClose,
    onConfirm,
}: CategorySelectionDialogProps) {
    const {
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        getSelectedCategory,
        addCategory,
    } = useStudyCategories();
    const { t } = useLanguage();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('📚');
    const [newCategoryColor, setNewCategoryColor] = useState('#E8644A');

    const selectedCategory = getSelectedCategory();

    // 学習に適したアイコンオプション
    const ICON_OPTIONS = [
        '📚', '📖', '✏️', '📝', '🔢', '🇬🇧', '🇯🇵',
        '🌍', '🔬', '⚗️', '🧪', '💻', '🎨', '🎵',
        '⚽', '🏃', '📐', '🖊️', '📓', '🗂️',
    ];

    // 学習に適したカラーパレット (落ち着いたトーン)
    const COLOR_OPTIONS = [
        '#E57373', // 珊瑚色
        '#64B5F6', // 勿忘草
        '#81C784', // 若草色
        '#BA68C8', // 藤色
        '#FFB74D', // 杏色
        '#A1887F', // 栗色
        '#FFD54F', // 山吹色
        '#4DB6AC', // 青竹色
        '#F06292', // 桃色
        '#7986CB', // 藍鼠
        '#4FC3F7', // 空色
        '#90A4AE', // 銀鼠
    ];

    const handleConfirm = () => {
        if (selectedCategoryId) {
            onConfirm();
            onClose();
        }
    };

    const handleCategorySelect = (category: StudyCategory) => {
        setSelectedCategoryId(category.id);
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            const newCategory = addCategory(
                newCategoryName.trim(),
                newCategoryColor,
                newCategoryIcon
            );
            setSelectedCategoryId(newCategory.id);
            setNewCategoryName('');
            setNewCategoryIcon('📚');
            setNewCategoryColor('#E57373');
            setShowAddForm(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-wide">{t('categories.dialogTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('categories.dialogDesc')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Selection */}
                    {selectedCategory && (
                        <div
                            className="p-4 rounded-xl border-2 text-center space-y-1 shadow-sm"
                            style={{
                                borderColor: selectedCategory.color,
                                backgroundColor: `${selectedCategory.color}15`,
                            }}
                        >
                            <div className="text-4xl drop-shadow-sm" style={{ color: selectedCategory.color }}>{selectedCategory.icon}</div>
                            <div className="text-xs font-bold opacity-80 uppercase tracking-widest text-muted-foreground">{t('categories.selected')}</div>
                            <div className="text-2xl font-bold tracking-wide text-foreground">{selectedCategory.name}</div>
                        </div>
                    )}

                    {/* Category Selection Grid */}
                    <div>
                        <label className="text-sm font-bold text-foreground mb-2 block tracking-wide pl-1">
                            {t('categories.select')}
                        </label>
                        <div
                            className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                        >
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${selectedCategoryId === category.id
                                        ? 'ring-2 ring-offset-2 ring-primary shadow-sm scale-[1.02]'
                                        : 'hover:scale-[1.02] hover:shadow-sm opacity-90 hover:opacity-100'
                                        }`}
                                    style={{
                                        borderColor: category.color,
                                        backgroundColor: `${category.color}20`,
                                    }}
                                >
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <div className="text-2xl" style={{ color: category.color }}>{category.icon}</div>
                                    <div className="text-xs font-bold truncate max-w-full tracking-wide text-foreground">{category.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add Category Section */}
                    <div className="border-t pt-4">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                {t('categories.addNew')}
                            </span>
                            {showAddForm ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>

                        {showAddForm && (
                            <div className="mt-4 space-y-3 p-4 rounded-lg bg-secondary/30">
                                <div>
                                    <label className="text-xs font-medium text-foreground block mb-2">
                                        {t('categories.name')}
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder={t('categories.name')}
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="rounded-lg border-2 border-border focus:border-primary focus:ring-0"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-foreground block mb-2">
                                        {t('categories.chooseIcon')}
                                    </label>
                                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
                                        style={{
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}
                                    >
                                        {ICON_OPTIONS.map((icon) => (
                                            <button
                                                key={icon}
                                                onClick={() => setNewCategoryIcon(icon)}
                                                className={`p-2 rounded text-xl transition-all ${newCategoryIcon === icon
                                                    ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                                                    : 'bg-secondary hover:bg-secondary/80'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-foreground block mb-2">
                                        {t('categories.chooseColor')}
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {COLOR_OPTIONS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setNewCategoryColor(color)}
                                                className={`w-full aspect-square rounded-lg transition-all ${newCategoryColor === color
                                                    ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                                                    : 'hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="p-3 rounded-lg text-white text-center space-y-1"
                                    style={{ backgroundColor: newCategoryColor }}
                                >
                                    <div className="text-2xl">{newCategoryIcon}</div>
                                    <div className="text-xs font-medium">
                                        {newCategoryName || t('categories.name')}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAddCategory}
                                        disabled={!newCategoryName.trim()}
                                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        {t('categories.create')}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewCategoryName('');
                                            setNewCategoryIcon('📚');
                                            setNewCategoryColor('#E8644A');
                                        }}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {t('settings.cancel')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {categories.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            {t('categories.noCategories')}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-end border-t pt-4">
                    <Button onClick={onClose} variant="outline">
                        {t('settings.cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={!selectedCategoryId}
                    >
                        {t('categories.startWith')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
