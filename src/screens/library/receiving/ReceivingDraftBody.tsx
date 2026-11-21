import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Stack, Button, LinearProgress } from '@mui/material';
import { useGetLibraryReceivingOptionsQuery } from 'src/redux/library/receiving-api';

import { ReceivingPreview } from './ReceivingPreview';
import { createReceivingLine } from './receiving-form';
import { ReceivingLineFields } from './ReceivingLineFields';
import { ReceivingMetadataFields } from './ReceivingMetadataFields';

import type { useReceivingDraft } from './useReceivingDraft';

export function ReceivingDraftBody({ draft }: { draft: ReturnType<typeof useReceivingDraft> }) {
  const query = useGetLibraryReceivingOptionsQuery(undefined, {
    skip: !draft.access.canReceive,
    refetchOnMountOrArgChange: true,
  });
  const disabled = draft.busy || draft.uncertain;
  return (
    <Stack spacing={2}>
      {query.isFetching && <LinearProgress aria-label="Loading receiving locations" />}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" disabled={disabled} onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Receiving locations could not be loaded. Your draft is retained.
        </Alert>
      )}
      {query.currentData && !query.currentData.sections.length && (
        <Alert severity="info">
          No Library receiving locations are available. A section and shelf must be configured
          before stock can be received.
        </Alert>
      )}
      <ReceivingMetadataFields
        formik={draft.formik}
        options={query.currentData}
        disabled={disabled}
      />
      {typeof draft.formik.errors.lines === 'string' && (
        <Alert severity="error">{draft.formik.errors.lines}</Alert>
      )}
      {draft.formik.values.lines.map((line, index) => (
        <ReceivingLineFields
          key={line.key}
          index={index}
          formik={draft.formik}
          options={query.currentData}
          disabled={disabled}
        />
      ))}
      <Box>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={disabled || draft.formik.values.lines.length >= 100}
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          onClick={() =>
            draft.formik.setFieldValue('lines', [
              ...draft.formik.values.lines,
              createReceivingLine(),
            ])
          }
        >
          Add title
        </Button>
      </Box>
      {draft.previewResult && <ReceivingPreview preview={draft.previewResult} />}
    </Stack>
  );
}
