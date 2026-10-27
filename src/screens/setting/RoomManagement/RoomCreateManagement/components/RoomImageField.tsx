import { useState, useEffect } from 'react';
import { UploadBox } from 'src/components/upload/upload-box';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetRoomImageQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { Box, Alert, Stack, Button, Typography, CircularProgress } from '@mui/material';

import { ROOM_IMAGE_ACCEPT, ROOM_IMAGE_MAX_BYTES } from '../services/room-image';

import type { IRoom } from '../types';
import type { RoomFormik } from '../types/room-form';

export function RoomImageField({ formik, room }: { formik: RoomFormik; room?: IRoom | null }) {
  const saved = useGetRoomImageQuery(room?.id ?? '', { skip: !room?.hasImage });
  const [preview, setPreview] = useState('');
  const [savedPreview, setSavedPreview] = useState('');
  const [error, setError] = useState('');
  const file = formik.values.imageFile;
  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!saved.currentData) return undefined;
    const url = URL.createObjectURL(saved.currentData);
    setSavedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [saved.currentData]);
  const image = file
    ? preview
    : !formik.values.removeImage && saved.currentData
      ? savedPreview
      : '';
  const hasImage = !!file || (!!room?.hasImage && !formik.values.removeImage);

  return (
    <FormSectionCard
      title="Room Image"
      icon="mdi:image-outline"
      descriptionTooltip="Optionally attach one photo to help identify this room. The image is saved when you submit the form."
    >
      <Stack spacing={1.5}>
        {image && (
          <Box
            component="img"
            src={image}
            alt="Room image preview"
            sx={{
              width: 1,
              maxHeight: 200,
              objectFit: 'contain',
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          />
        )}
        {!file && !formik.values.removeImage && saved.isFetching && (
          <Stack direction="row" spacing={1} role="status">
            <CircularProgress size={18} />
            <Typography variant="body2">Loading room image…</Typography>
          </Stack>
        )}
        {!file && !formik.values.removeImage && saved.isError && (
          <Alert
            severity="error"
            action={
              <Button type="button" onClick={() => saved.refetch()}>
                Retry
              </Button>
            }
          >
            Room image could not be loaded. You can retry or choose a replacement.
          </Alert>
        )}
        <UploadBox
          multiple={false}
          accept={ROOM_IMAGE_ACCEPT}
          maxSize={ROOM_IMAGE_MAX_BYTES}
          disabled={formik.isSubmitting}
          boxRootProps={{
            role: 'button',
            'aria-label': hasImage ? 'Replace room image' : 'Upload room image',
          }}
          error={!!error}
          onDropAccepted={([selected]) => {
            setError('');
            formik.setValues({ ...formik.values, imageFile: selected, removeImage: false });
          }}
          onDropRejected={() => setError('Choose one JPG or PNG image up to 5 MB.')}
          placeholder={
            <Typography variant="body2" color="text.primary">
              {hasImage ? 'Replace room image' : 'Upload room image'}
            </Typography>
          }
          sx={{
            width: 1,
            minHeight: 64,
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {file ? `${file.name} · ` : ''}Optional. JPG or PNG, up to 5 MB.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {hasImage && (
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={formik.isSubmitting}
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => {
              setError('');
              formik.setValues({
                ...formik.values,
                imageFile: null,
                removeImage: !!room?.hasImage,
              });
            }}
          >
            Remove room image
          </Button>
        )}
      </Stack>
    </FormSectionCard>
  );
}
