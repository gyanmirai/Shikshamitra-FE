import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionTrack,
  AdmissionEntryMode,
  BulkAdmissionOfferingResult,
} from 'src/redux/student/admissions/admission-offerings-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';

import { admissionTrackLabels, admissionEntryModeLabels } from './admission-offering-model';
import {
  bulkOfferingFieldLabels,
  getBulkOfferingFieldIssues,
  bulkOfferingValidationFields,
} from './bulk-admission-offering-validation';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

type Props = {
  preview: BulkAdmissionOfferingResult | null;
  canCreate: boolean;
  standardNameById: Record<string, string>;
  onEdit?: () => void;
  busy?: boolean;
  track?: AdmissionTrack;
  entryMode?: AdmissionEntryMode;
};

export function BulkAdmissionOfferingPreview({
  preview,
  canCreate,
  standardNameById,
  onEdit,
  busy = false,
  track = 0,
  entryMode = 0,
}: Props) {
  const items = preview?.items ?? [];
  const blockedCount = items.filter((item) => !item.canSaveInactive).length;
  const fieldIssues = getBulkOfferingFieldIssues(preview, standardNameById);
  const configurationIssues = Object.entries(fieldIssues).filter(
    ([field]) => field !== 'standardIds'
  );
  const sharedMessages =
    items.length > 1
      ? [
          ...new Set(
            items[0].errors
              .filter(
                (error) =>
                  !bulkOfferingValidationFields[error.code] &&
                  items.every((item) =>
                    item.errors.some(
                      (entry) => entry.code === error.code && entry.message === error.message
                    )
                  )
              )
              .map((error) => error.message)
          ),
        ]
      : [];
  const rows = items.map((item) => ({
    ...item,
    id: item.standardId,
    messages: [
      ...new Set(
        item.errors
          .filter(
            (error) =>
              !bulkOfferingValidationFields[error.code] ||
              bulkOfferingValidationFields[error.code] === 'standardIds'
          )
          .map((error) => error.message)
      ),
    ].filter((message) => !sharedMessages.includes(message)),
  }));
  const columns: IColumn[] = [
    {
      id: 'code',
      label: 'Class / offering code',
      isSort: false,
      isFilter: false,
      cellSx: { verticalAlign: 'top' },
      render: (_, raw) => {
        const item = raw as (typeof rows)[number];
        return (
          <Stack spacing={0.5} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <Typography variant="subtitle2">
              {standardNameById[item.standardId] || 'Selected class'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.code}
            </Typography>
            {item.messages.length > 0 ? (
              <Box component="ul" sx={{ my: 0.5, pl: 2 }}>
                {item.messages.map((message) => (
                  <Typography
                    component="li"
                    key={message}
                    variant="body2"
                    color={item.canSaveInactive ? 'text.secondary' : 'error.main'}
                  >
                    {message}
                  </Typography>
                ))}
              </Box>
            ) : !item.canSaveInactive && !item.errors.length ? (
              <Typography variant="body2" color="error.main">
                This class could not be validated. Go Back and preview it again.
              </Typography>
            ) : null}
            {item.canSaveInactive && !item.canActivate && (
              <Typography variant="caption" color="text.secondary">
                You can create this offering now, but its configuration needs attention before
                activation.
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      id: 'canSaveInactive',
      label: 'Status',
      width: 144,
      minWidth: 144,
      isSort: false,
      isFilter: false,
      cellSx: { verticalAlign: 'top' },
      render: (canSaveInactive: boolean) => (
        <Label color={canSaveInactive ? 'success' : 'error'}>
          {canSaveInactive ? 'Ready to create' : 'Cannot create'}
        </Label>
      ),
    },
  ];

  return (
    <FormSectionCard
      icon="mdi:clipboard-check-outline"
      title="Preview offerings"
      descriptionTooltip="Review each class before creating the batch. Offerings are saved as Inactive; activation remains a separate action."
      action={
        items.length ? (
          <Label>
            {items.length} class{items.length === 1 ? '' : 'es'}
          </Label>
        ) : undefined
      }
      titleTypographyProps={{ sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 } }}
    >
      {!items.length ? (
        <StudentFeedback notificationKey="STU-0302" presentation="inline" severity="warning">
          No offerings to preview. Go Back and select at least one class.
        </StudentFeedback>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">
                {canCreate
                  ? `${items.length} offering${items.length === 1 ? '' : 's'} ready to create`
                  : blockedCount
                    ? `${blockedCount} of ${items.length} ${items.length === 1 ? 'class needs' : 'classes need'} changes`
                    : 'This batch cannot be created yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {admissionTrackLabels[track]} · {admissionEntryModeLabels[entryMode]}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {canCreate
                  ? 'One offering per class will be saved as Inactive. Activate it from the offering list when ready.'
                  : 'Nothing will be created until all class issues are resolved.'}
              </Typography>
            </Box>
            {onEdit && (
              <Button
                size="small"
                variant="outlined"
                disabled={busy}
                startIcon={<Iconify icon={GlobalIcons.edit} width={18} />}
                onClick={onEdit}
                sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
              >
                Edit selection
              </Button>
            )}
          </Stack>

          {configurationIssues.length > 0 && (
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2">Configuration checks</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {configurationIssues.map(([field, issue]) => (
                  <Box key={field}>
                    <Typography variant="caption" color="text.secondary">
                      {bulkOfferingFieldLabels[field as keyof BulkOfferingValues]}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={issue.blocking ? 'error.main' : 'text.secondary'}
                      sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
                    >
                      {issue.blocking ? '' : 'Before activation: '}
                      {issue.message}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {sharedMessages.length > 0 && (
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2">Other checks</Typography>
              <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2.5 }}>
                {sharedMessages.map((message) => (
                  <Typography
                    component="li"
                    key={message}
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {message}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {/* Embedded review: the drawer body owns vertical scrolling; every class stays visible. */}
          <CustomizableTable
            tableId="bulk-admission-offering-preview"
            tableTitle="Offerings to create"
            columns={columns}
            data={rows}
            showToolbar={false}
            isSearch={false}
            isFilter={false}
            isPagination={false}
            isShowedDense={false}
            wrapperProps={{ sx: { height: 'auto', minWidth: 0, flex: 'none' } }}
            tableContainerProps={{ sx: { height: 'auto', flex: 'none' } }}
          />
        </>
      )}
    </FormSectionCard>
  );
}
