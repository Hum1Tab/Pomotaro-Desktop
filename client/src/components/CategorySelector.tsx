import { useStudyCategories } from '@/hooks/useStudyCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function CategorySelector() {
  const { t } = useLanguage();
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    addCategory,
    deleteCategory,
    updateCategory,
  } = useStudyCategories();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📚');
  const [newCategoryColor, setNewCategoryColor] = useState('#E8644A');
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const ICON_OPTIONS = [
    // 学習科目 (12個)
    '📐', '💻', '🌍', '🔬', '📚', '🎨', '📝', '🎓', '🧪', '📖', '✏️', '🖊️',
    // 趣味・スポーツ (8個)
    '🎵', '⚽', '🏀', '🎮', '🎭', '🎬', '🏊', '🎸',
    // 食事・生活 (6個)
    '🍕', '🍱', '☕', '🏠', '💼', '👥',
    // 目標・感情 (6個)
    '🎯', '💡', '⭐', '🔥', '❤️', '🌸',
    // その他 (4個)
    '🚀', '💰', '🌈', '⚡'
  ];

  const COLOR_PALETTE = [
    // 日本の伝統色・自然色 (落ち着いたトーン)
    '#E57373', // 珊瑚色 (Coral Red)
    '#F06292', // 桃色 (Pink)
    '#BA68C8', // 藤色 (Lavender)
    '#9575CD', // 江戸紫 (Purple)
    '#7986CB', // 藍鼠 (Indigo)
    '#64B5F6', // 勿忘草 (Sky Blue)
    '#4FC3F7', // 空色 (Light Blue)
    '#4DB6AC', // 青竹色 (Teal)
    '#81C784', // 若草色 (Light Green)
    '#AED581', // 萌黄色 (Lime Green)
    '#FFD54F', // 山吹色 (Amber)
    '#FFB74D', // 杏色 (Orange)
    '#A1887F', // 栗色 (Brown)
    '#90A4AE', // 銀鼠 (Blue Grey)
  ];

  const displayedIcons = showAllIcons ? ICON_OPTIONS : ICON_OPTIONS.slice(0, 12);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const finalColor = customColor.trim() || newCategoryColor;
      addCategory(newCategoryName, finalColor, newCategoryIcon);
      setNewCategoryName('');
      setNewCategoryIcon('📚');
      setNewCategoryColor('#E57373');
      setCustomColor('');
      setShowAddForm(false);
      setShowAllIcons(false);
    }
  };

  const handleUpdateCategory = (id: string) => {
    if (editingName.trim()) {
      updateCategory(id, { name: editingName });
      setEditingId(null);
      setEditingName('');
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Current Selection Display */}
      {selectedCategory && (
        <div
          className="p-6 rounded-xl border-2 transition-all duration-300 text-center space-y-2 shadow-sm"
          style={{
            borderColor: selectedCategory.color,
            backgroundColor: `${selectedCategory.color}15`, // Very light tint 15%
          }}
        >
          <div className="text-5xl drop-shadow-sm" style={{ color: selectedCategory.color }}>{selectedCategory.icon}</div>
          <div className="text-sm font-bold opacity-80 tracking-widest uppercase text-muted-foreground">{t('categories.current')}</div>
          <div className="text-3xl font-bold tracking-wide text-foreground">{selectedCategory.name}</div>
        </div>
      )}

      {/* Category Grid */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground tracking-wide pl-1">{t('categories.select')}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`p-4 rounded-xl transition-all duration-200 border-2 text-left flex items-center gap-3 group relative overflow-hidden ${selectedCategoryId === category.id
                ? 'ring-2 ring-offset-2 ring-primary shadow-md scale-[1.02]'
                : 'hover:scale-[1.02] hover:shadow-sm opacity-90 hover:opacity-100'
                }`}
              style={{
                borderColor: category.color,
                backgroundColor: `${category.color}20`, // 20% opacity background
              }}
            >
              {/* Decorative side bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: category.color }}
              />

              <div className="text-3xl group-hover:scale-110 transition-transform duration-200 pl-2" style={{ color: category.color }}>
                {category.icon}
              </div>
              <div className="text-sm font-bold truncate tracking-wide text-foreground">
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Category Section */}
      <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border-2 border-border">
        <label className="text-sm font-semibold text-foreground">{t('categories.manage')}</label>

        {!showAddForm ? (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('categories.addNew')}
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              type="text"
              placeholder={t('categories.name')}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="rounded-lg border-2 border-border focus:border-primary focus:ring-0 bg-input text-sm"
            />

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">{t('categories.chooseIcon')}</label>
              <div className="grid grid-cols-8 gap-2">
                {displayedIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewCategoryIcon(icon)}
                    className={`p-2 rounded-lg text-xl transition-all ${newCategoryIcon === icon
                      ? 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary'
                      : 'bg-secondary hover:bg-secondary/80'
                      }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {!showAllIcons && (
                <Button
                  onClick={() => setShowAllIcons(true)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  もっと見る ({ICON_OPTIONS.length - 12}個)
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">{t('categories.chooseColor')}</label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={`h-10 rounded-lg transition-all ${newCategoryColor === color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-110'
                      }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">カスタムカラー (HEX)</label>
                <Input
                  type="text"
                  placeholder="#FF0000"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddCategory}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
              >
                {t('categories.create')}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategoryName('');
                  setNewCategoryIcon('📚');
                  setNewCategoryColor('#E8644A');
                  setCustomColor('');
                  setShowAllIcons(false);
                }}
                variant="outline"
                className="flex-1 border-2 border-border text-foreground hover:border-primary hover:text-primary"
              >
                {t('settings.cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">{t('categories.yourCategories')}</label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card/30 hover:bg-card transition-all group"
              style={{ borderColor: `${category.color}40` }} // Low opacity border
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 bg-card"
                  style={{ borderColor: category.color }}
                >
                  {category.icon}
                </div>
                {editingId === category.id ? (
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8 text-sm border-2 border-primary focus:ring-0 bg-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateCategory(category.id);
                      }
                    }}
                  />
                ) : (
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                )}
              </div>

              <div className="flex gap-1">
                {editingId === category.id ? (
                  <>
                    <Button
                      onClick={() => handleUpdateCategory(category.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                    >
                      ✓
                    </Button>
                    <Button
                      onClick={() => setEditingId(null)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => deleteCategory(category.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
