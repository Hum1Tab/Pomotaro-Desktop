import { useState } from 'react';
import { useTaskTags } from '@/hooks/useTaskTags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

export function TagManager() {
  const { tags, addTag, updateTag, deleteTag, defaultColors } = useTaskTags();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag(newTagName, selectedColor);
      setNewTagName('');
      setSelectedColor(defaultColors[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Create New Tag</label>
        <div className="flex gap-2 flex-wrap">
          <Input
            type="text"
            placeholder="Tag name (max 14 characters)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value.substring(0, 14))}
            maxLength={14}
            className="flex-1 min-w-[200px] rounded-lg border-2 border-border focus:border-primary focus:ring-0 bg-input text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button
            onClick={handleAddTag}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 sm:px-4 font-medium"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Color Palette</label>
        <div className="flex gap-2 flex-wrap">
          {defaultColors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-lg transition-all ${
                selectedColor === color ? 'ring-2 ring-offset-2 ring-foreground' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Your Tags</label>
        <div className="space-y-2">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet. Create one to get started!</p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm font-medium text-foreground">{tag.name}</span>
                </div>
                <Button
                  onClick={() => deleteTag(tag.id)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
