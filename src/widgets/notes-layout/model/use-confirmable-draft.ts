import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebouncedValue } from '@shared/hooks/use-debounced-value';

export interface ConfirmableDraftOptions<TValue> {
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onConfirm: (itemId: string, value: TValue) => void;
  onAutoSaveDraft?: (itemId: string, value: TValue) => void;
  autoSaveDelayMs?: number;
  onDiscard?: (itemId: string, originalValue: TValue) => void;
}

export interface ConfirmableDraftController<TValue> {
  isEditing: boolean;
  editingItemId: string | null;
  originalValue: TValue | null;
  draftValue: TValue;
  startEditing: (itemId: string, initialValue: TValue) => void;
  stopEditing: () => void;
  finishEditing: () => void;
  setDraftValue: (nextValue: TValue) => void;
  prompt: {
    isOpen: boolean;
    close: () => void;
    confirmYes: () => void;
    confirmNo: () => void;
  };
}

export function useConfirmableDraft<TValue>(
  options: ConfirmableDraftOptions<TValue>,
): ConfirmableDraftController<TValue> {
  const {
    selectedItemId,
    onSelectItem,
    onConfirm,
    onAutoSaveDraft,
    autoSaveDelayMs = 600,
    onDiscard,
  } = options;

  const lastAutoSavedValueRef = useRef<TValue | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [originalValue, setOriginalValue] = useState<TValue | null>(null);
  const [draftValue, setDraftValueState] = useState<TValue>(() => {
    return undefined as TValue;
  });

  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [pendingSelectedItemId, setPendingSelectedItemId] = useState<
    string | null
  >(null);

  const debouncedDraftValue = useDebouncedValue(draftValue, autoSaveDelayMs);

  const stopEditing = useCallback((): void => {
    setIsEditing(false);
    setEditingItemId(null);
    setOriginalValue(null);
    setIsPromptOpen(false);
    setPendingSelectedItemId(null);
    lastAutoSavedValueRef.current = null;
  }, []);

  const startEditing = useCallback(
    (itemId: string, initialValue: TValue): void => {
      setEditingItemId(itemId);
      setOriginalValue(initialValue);
      setDraftValueState(initialValue);
      setIsEditing(true);
      setIsPromptOpen(false);
      setPendingSelectedItemId(null);
      lastAutoSavedValueRef.current = initialValue;
    },
    [],
  );

  const setDraftValue = useCallback((nextValue: TValue): void => {
    setDraftValueState(nextValue);
  }, []);

  const proceedToPendingItem = useCallback((): void => {
    if (!pendingSelectedItemId) return;
    onSelectItem(pendingSelectedItemId);
    setPendingSelectedItemId(null);
  }, [onSelectItem, pendingSelectedItemId]);

  const finishEditing = useCallback((): void => {
    if (!isEditing) return;
    if (!editingItemId) return;
    if (originalValue === null) return;

    if (draftValue !== originalValue) {
      onConfirm(editingItemId, draftValue);
    }

    stopEditing();
  }, [
    draftValue,
    editingItemId,
    isEditing,
    onConfirm,
    originalValue,
    stopEditing,
  ]);

  const closePrompt = useCallback((): void => {
    setIsPromptOpen(false);
    setPendingSelectedItemId(null);
  }, []);

  const confirmYes = useCallback((): void => {
    if (!editingItemId) return;
    if (originalValue === null) return;

    if (draftValue !== originalValue) {
      onConfirm(editingItemId, draftValue);
    }

    setIsPromptOpen(false);
    stopEditing();
    proceedToPendingItem();
  }, [
    draftValue,
    editingItemId,
    onConfirm,
    originalValue,
    proceedToPendingItem,
    stopEditing,
  ]);

  const confirmNo = useCallback((): void => {
    if (!editingItemId) return;
    if (originalValue === null) return;

    if (onDiscard) {
      onDiscard(editingItemId, originalValue);
    }

    setIsPromptOpen(false);
    stopEditing();
    proceedToPendingItem();
  }, [
    editingItemId,
    onDiscard,
    originalValue,
    proceedToPendingItem,
    stopEditing,
  ]);

  useEffect(() => {
    if (!isEditing) return;
    if (!editingItemId) return;
    if (!selectedItemId) return;
    if (selectedItemId === editingItemId) return;
    if (originalValue === null) return;

    const hasUnsavedChanges = draftValue !== originalValue;

    if (hasUnsavedChanges) {
      setPendingSelectedItemId(selectedItemId);
      setIsPromptOpen(true);
      onSelectItem(editingItemId);
      return;
    }

    stopEditing();
  }, [
    draftValue,
    editingItemId,
    isEditing,
    onSelectItem,
    originalValue,
    selectedItemId,
    stopEditing,
  ]);

  useEffect(() => {
    if (!onAutoSaveDraft) return;
    if (!isEditing) return;
    if (!editingItemId) return;
    if (!selectedItemId) return;
    if (selectedItemId !== editingItemId) return;
    if (isPromptOpen) return;

    const lastAutoSavedValue = lastAutoSavedValueRef.current;
    if (lastAutoSavedValue === debouncedDraftValue) return;

    onAutoSaveDraft(editingItemId, debouncedDraftValue);
    lastAutoSavedValueRef.current = debouncedDraftValue;
  }, [
    debouncedDraftValue,
    editingItemId,
    isEditing,
    isPromptOpen,
    onAutoSaveDraft,
    selectedItemId,
  ]);

  return {
    isEditing,
    editingItemId,
    originalValue,
    draftValue,
    startEditing,
    stopEditing,
    finishEditing,
    setDraftValue,
    prompt: {
      isOpen: isPromptOpen,
      close: closePrompt,
      confirmYes,
      confirmNo,
    },
  };
}
