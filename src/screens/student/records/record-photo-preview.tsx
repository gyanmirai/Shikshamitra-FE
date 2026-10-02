import { useState, useEffect } from 'react';
import { Box, Stack, Alert, Button, Typography, LinearProgress } from '@mui/material';
import { useGetStudentRecordPhotoPreviewQuery } from 'src/redux/student/records/student-record-changes-api';

export default function RecordPhotoPreview({ studentId, uri }: { studentId: string; uri: string }) {
  const match =
    /^\/api\/students\/records\/changes\/students\/([0-9a-f-]{36})\/photo-drafts\/([0-9a-f-]{36})$/i.exec(
      uri
    );
  const valid = Boolean(match && match[1].toLowerCase() === studentId.toLowerCase());
  const query = useGetStudentRecordPhotoPreviewQuery(
    { studentId, draftId: match?.[2] ?? '' },
    { skip: !valid }
  );
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(null);
  useEffect(() => {
    const blob = query.currentData;
    if (!blob || query.isError) return undefined;
    const url = URL.createObjectURL(blob);
    setPreview({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [query.currentData, query.isError]);
  if (!valid) return <Alert severity="error">The proposed photo preview is unavailable.</Alert>;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Proposed student photo</Typography>
      {query.isFetching && <LinearProgress aria-label="Loading proposed student photo" />}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => query.refetch()}>
              Retry photo
            </Button>
          }
        >
          The proposed photo could not be opened with your current access.
        </Alert>
      )}
      {!query.isError && preview && preview.blob === query.currentData && (
        <Box
          component="img"
          src={preview.url}
          alt="Proposed student photograph for this change"
          sx={{
            width: 180,
            height: 180,
            objectFit: 'contain',
            bgcolor: 'background.neutral',
            borderRadius: 1,
          }}
        />
      )}
    </Stack>
  );
}
