import { useEffect } from 'react';

export interface KeyboardShortcuts {
  startPause?: () => void;
  reset?: () => void;
  nextSession?: () => void;
  prevSession?: () => void;
  toggleSettings?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          // Start/Pause: Space
          event.preventDefault();
          shortcuts.startPause?.();
          break;
        case 'KeyR':
          // Reset: R
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            shortcuts.reset?.();
          }
          break;
        case 'ArrowRight':
          // Next Session: Right Arrow
          event.preventDefault();
          shortcuts.nextSession?.();
          break;
        case 'ArrowLeft':
          // Previous Session: Left Arrow
          event.preventDefault();
          shortcuts.prevSession?.();
          break;
        case 'KeyS':
          // Toggle Settings: Ctrl+S
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            shortcuts.toggleSettings?.();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
}
