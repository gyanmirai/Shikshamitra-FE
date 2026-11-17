
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button } from '@mui/material';
import { useRef, useState, useLayoutEffect } from 'react';

import { PhotoEditorDialog } from './photo-editor-dialog';

import type { IdentityCardPhotoEdit, IdentityCardPhotoRecord } from '../types';

export function CardPhotoAction({ record, onPhotoEdit, disabled }: {
  record?: IdentityCardPhotoRecord; onPhotoEdit: (edit: IdentityCardPhotoEdit) => void; disabled?: boolean;
}) {
  const session = useRef(0);
  const [photo, setPhoto] = useState<IdentityCardPhotoEdit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useLayoutEffect(() => {
    session.current += 1; setPhoto(null); setLoading(false); setError('');
    return () => { session.current += 1; };
  }, [record?.id, disabled]);
  const open = async () => {
    if (!record || disabled || loading) return;
    session.current += 1;
    const token = session.current; setLoading(true); setError('');
    try {
      const result = await record.load();
      if (token !== session.current) return;
      if (result.recordId !== record.id) throw new Error('Photo identity did not match.');
      setPhoto(result);
    } catch {
      if (token === session.current) setError('The full photo could not be loaded. Check access and retry.');
    } finally { if (token === session.current) setLoading(false); }
  };
  return (
    <Stack spacing={1}>
      <Button size="small" type="button" color="inherit" variant="outlined" loading={loading} disabled={disabled || !record || loading} onClick={open} sx={{ alignSelf: 'flex-start' }} startIcon={<Iconify icon={GlobalIcons.edit} width={18} />}>Edit photo</Button>
      {error && <Alert severity="error">{error}</Alert>}
      {photo && record && <PhotoEditorDialog open source={{ imageData: photo.imageData, name: record.name }} disabled={disabled} onClose={() => setPhoto(null)} onApply={(imageData) => {
        if (!disabled && photo.recordId === record.id) { onPhotoEdit({ ...photo, imageData }); setPhoto(null); }
      }} />}
    </Stack>
  );
}
