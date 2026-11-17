import { useRef, useState, useEffect } from 'react';

import type { IdentityCardPhotoEdit, IdentityCardDesignerProps } from '../types';

export function useStudioPhoto({
  photoRecords = [],
  photoEdits = [],
  onPhotoEdit,
  onEditorBusyChange,
}: IdentityCardDesignerProps) {
  const [recordId, setRecordId] = useState('');
  const [source, setSource] = useState<IdentityCardPhotoEdit | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const record = photoRecords.find((item) => item.id === recordId) ?? photoRecords[0];
  const edit = photoEdits.find((item) => item.recordId === record?.id);
  useEffect(() => {
    generation.current += 1;
    setSource(null);
    setLoading(false);
    setError('');
  }, [record?.id]);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    []
  );
  async function open() {
    if (!record || !onPhotoEdit) return;
    generation.current += 1;
    const token = generation.current;
    setLoading(true);
    setError('');
    onEditorBusyChange?.(true);
    try {
      const result = await record.load();
      if (result.recordId !== record.id) throw new Error('Photo does not match this cardholder.');
      if (token === generation.current) setSource(result);
    } catch {
      if (token === generation.current)
        setError('The original photo could not be loaded. Check access and try again.');
    } finally {
      if (token === generation.current) setLoading(false);
      onEditorBusyChange?.(false);
    }
  }
  return {
    record,
    edit,
    source,
    error,
    loading,
    setRecordId,
    open,
    clearError: () => setError(''),
    close: () => setSource(null),
    apply: (imageData: string) => {
      if (source && record && source.recordId === record.id)
        onPhotoEdit?.({ ...source, imageData });
      setSource(null);
    },
    sourceImage:
      source && edit?.sourceHash === source.sourceHash ? edit.imageData : source?.imageData,
  };
}
