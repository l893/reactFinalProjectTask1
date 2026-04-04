import { useEffect } from 'react';

export interface HotkeyConfig {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  isEnabled?: boolean;
  handler: () => void;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  if (target.isContentEditable) return true;

  return false;
}

export function useHotkeys(hotkeys: HotkeyConfig[]): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const isEditable = isEditableElement(event.target);

      for (const hotkey of hotkeys) {
        if (hotkey.isEnabled === false) continue;

        const expectedKey = hotkey.key.toLowerCase();
        const actualKey = event.key.toLowerCase();

        if (expectedKey !== actualKey) continue;
        if (Boolean(hotkey.ctrlOrMeta) !== (event.ctrlKey || event.metaKey))
          continue;
        if (Boolean(hotkey.shift) !== event.shiftKey) continue;
        if (Boolean(hotkey.alt) !== event.altKey) continue;

        if (!hotkey.ctrlOrMeta && isEditable) return;

        if (hotkey.preventDefault !== false) {
          event.preventDefault();
        }

        hotkey.handler();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys]);
}
