import type { AdmissionFormChangeHistory } from 'src/redux/student/admissions/admission-applications-api';

import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { List, Stack, ListItem, Skeleton, Typography } from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { applicationHistoryCardProps } from './application-history-card-props';

const changeLabels: Record<string, string> = {
  Created: 'Created',
  DraftSaved: 'Draft saved',
  Submitted: 'Submitted',
  Reopened: 'Reopened',
  ParentDraftSaved: 'Parent draft saved',
  FormCorrected: 'Form corrected',
  SectionVerification: 'Section verification recorded',
  CorrectionRequested: 'Correction requested',
  JoiningDateConfirmed: 'Joining date confirmed',
  FamilyPrefilled: 'Family details prefilled',
};

export function FormHistoryCard({
  history,
  loading = false,
  onRetry,
}: {
  history: AdmissionFormChangeHistory[];
  loading?: boolean;
  onRetry?: () => void;
}) {
  if (!loading && onRetry) return <AdmissionQueryError onRetry={onRetry} />;
  if (!history.length && !loading) return null;
  return (
    <FormSectionCard
      {...applicationHistoryCardProps}
      title="Form History"
      titleTypographyProps={{ component: 'h4' }}
      descriptionTooltip="Recorded changes to this application's registration form."
      icon={GlobalIcons.doc}
    >
      {loading ? (
        <Stack spacing={0.75} role="status" aria-label="Loading Application History">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </Stack>
      ) : (
        <List disablePadding>
          {history.map((item, index) => (
            <ListItem
              key={item.id}
              disableGutters
              divider={index < history.length - 1}
              sx={{ display: 'block', minWidth: 0, overflowWrap: 'anywhere', py: 0.75 }}
            >
              <Stack
                direction="row"
                gap={0.5}
                alignItems="baseline"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Typography variant="subtitle2">
                  {changeLabels[item.changeType] ??
                    item.changeType.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
                </Typography>
                <Typography
                  component="time"
                  dateTime={item.occurredAt}
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {fDateTime(item.occurredAt, ADMISSION_DATE_TIME_FORMAT)}
                </Typography>
              </Stack>
              {correctionSummary(item.changedFieldsJson, item.changeType).map((text) => (
                <Typography key={text} variant="body2" color="text.secondary">
                  {text}
                </Typography>
              ))}
            </ListItem>
          ))}
        </List>
      )}
    </FormSectionCard>
  );
}

function correctionSummary(json: string | null | undefined, changeType: string): string[] {
  if (changeType !== 'FormCorrected' || !json) return [];
  try {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
    return [
      typeof data.Reason === 'string' ? data.Reason : '',
      Array.isArray(data.ChangedFields)
        ? data.ChangedFields.filter((field: unknown) => typeof field === 'string').join(', ')
        : '',
    ].filter(Boolean);
  } catch {
    return [];
  }
}
