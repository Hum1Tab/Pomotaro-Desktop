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

    // 学習に適したカラーパレット
    const COLOR_OPTIONS = [
        '#E8644A', // 赤（数学）
        '#4A9EE8', // 青（英語）
        '#8B9D83', // 緑（国語）
        '#9B59B6', // 紫（理科）
        '#E67E22', // オレンジ（社会）
        '#C9A88A', // ベージュ（古典）
        '#F39C12', // 黄色
        '#16A085', // ターコイズ
        '#E74C3C', // 赤
        '#3498DB', // 青
        '#2ECC71', // 緑
        '#9B59B6', // 紫
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
            setNewCategoryColor('#E8644A');
            setShowAddForm(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{t('categories.dialogTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('categories.dialogDesc')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Selection */}
                    {selectedCategory && (
                        <div
                            className="p-4 rounded-lg text-white text-center space-y-2"
                            style={{ backgroundColor: selectedCategory.color }}
                        >
                            <div className="text-3xl">{selectedCategory.icon}</div>
                            <div className="text-sm font-medium opacity-90">{t('categories.selected')}</div>
                            <div className="text-lg font-bold">{selectedCategory.name}</div>
                        </div>
                    )}

                    {/* Category Selection Grid */}
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
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
                                    className={`p-3 rounded-lg transition-all ${selectedCategoryId === category.id
                                        ? 'ring-2 ring-offset-2 ring-foreground scale-105'
                                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                                        }`}
                                    style={{
                                        backgroundColor: category.color,
                                        color: 'white',
                                    }}
                                >
                                    <div className="text-2xl mb-1">{category.icon}</div>
                                    <div className="text-xs font-medium truncate">{category.name}</div>
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
