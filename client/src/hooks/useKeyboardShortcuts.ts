import { useEffect, useRef } from 'react';

export interface KeyboardShortcuts {
  startPause?: () => void;
  reset?: () => void;
  nextSession?: () => void;
  prevSession?: () => void;
  toggleSettings?: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Global keyboard shortcuts.
 *
 * Handlers are read from a ref so the listener is attached once instead of
 * being removed and re-added on every parent render (the caller passes a fresh
 * object literal each time).
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore while the user is typing or a modal owns the keyboard.
      if (isTypingTarget(event.target)) return;
      if (event.defaultPrevented) return;

      const current = shortcutsRef.current;

      switch (event.code) {
        case 'Space':
          // Start/Pause: Space
          event.preventDefault();
          current.startPause?.();
          break;
        case 'KeyR':
          // Reset: Ctrl+R
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            current.reset?.();
          }
          break;
        case 'ArrowRight':
          // Next Session: Right Arrow
          event.preventDefault();
          current.nextSession?.();
          break;
        case 'ArrowLeft':
          // Previous Session: Left Arrow
          event.preventDefault();
          current.prevSession?.();
          break;
        case 'KeyS':
          // Toggle Settings: Ctrl+S
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            current.toggleSettings?.();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
}
