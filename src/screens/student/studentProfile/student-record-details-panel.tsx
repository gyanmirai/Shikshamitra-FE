import type {
  StudentRecordDetails,
  RecordRegistrationSource,
} from 'src/redux/student/records/student-record-details-api';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Menu, Stack, Alert, Button, MenuItem, Typography } from '@mui/material';

import { ProfileValues } from './student-profile-overview';
import {
  PROFILE_SECTIONS,
  profileFieldValue,
  profileFieldOptions,
  typedRepeatableValues,
  structuredProfileEntries,
  visibleRegistrationSections,
} from './student-record-profile-model';

export function RegistrationSourceFields({
  source,
  original = false,
  onHistory,
}: {
  source: RecordRegistrationSource;
  original?: boolean;
  onHistory?: () => void;
}) {
  const sections = visibleRegistrationSections(source, original, !original);
  if (!source.definition)
    return <Alert severity="info">These captured details are restricted by school policy.</Alert>;
  if (!sections.length)
    return (
      <Typography variant="body2" color="text.secondary">
        No {original ? 'submitted' : 'additional school'} details are available in this form.
      </Typography>
    );
  return (
    <Stack spacing={1.5}>
      {sections.map(({ section, entryIndex, fields }) => (
        <Box key={`${section.id}-${entryIndex ?? 'single'}`}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {section.name}
            {entryIndex != null ? ` ${entryIndex + 1}` : ''}
          </Typography>
          <Grid container spacing={1.5}>
            {fields.map(({ field, value }) => (
              <Grid key={field.code} size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {profileFieldValue(
                      field,
                      value,
                      profileFieldOptions(source, field.code, entryIndex)
                    )}
                  </Typography>
                  {!original &&
                    JSON.stringify(value) !==
                      JSON.stringify(
                        entryIndex == null
                          ? source.originalValues[field.code]
                          : typedRepeatableValues(source.originalValues[field.code])[entryIndex]
                      ) && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Label>Updated</Label>
                        {onHistory && (
                          <Button
                            onClick={onHistory}
                            size="small"
                            aria-label={`View history for ${field.label}`}
                          >
                            View history
                          </Button>
                        )}
                      </Stack>
                    )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Stack>
  );
}

export function StudentRecordDetailsPanel({
  details,
  section,
  canCreate,
  changeHref,
  onCustomChange,
  onHistory,
}: {
  details: StudentRecordDetails;
  section?: string | null;
  canCreate: boolean;
  changeHref: (section: string) => string;
  onCustomChange: () => void;
  onHistory: () => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const sections = details.structuredSections.filter(
    (item) => item.isMasked || item.hasData || item.section === section
  );
  const empty = details.structuredSections.filter(
    (item) => !item.isMasked && !item.hasData && item.canEdit
  );
  const sources = details.registrationSources.filter(
    (source) => source.isBaseline || visibleRegistrationSections(source, false, true).length > 0
  );
  return (
    <Stack spacing={1.5}>
      {canCreate && empty.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={(event) => setAnchor(event.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={Boolean(anchor)}
          >
            Add details
          </Button>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            {empty.map((item) => (
              <MenuItem
                key={item.section}
                component={RouterLink}
                href={changeHref(item.section)}
                onClick={() => setAnchor(null)}
              >
                {PROFILE_SECTIONS.find((entry) => entry.key === item.section)?.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}
      <Grid container spacing={1.5}>
        {sections.map((item) => {
          const config = PROFILE_SECTIONS.find((entry) => entry.key === item.section)!;
          return (
            <Grid key={item.section} size={{ xs: 12, md: 6 }}>
              <FormSectionCard
                icon={config.icon}
                title={config.label}
                action={
                  canCreate && item.canEdit && !item.isMasked ? (
                    <Button component={RouterLink} href={changeHref(item.section)}>
                      Request change
                    </Button>
                  ) : undefined
                }
              >
                {item.isMasked ? (
                  <Alert severity="info">These details are restricted by school policy.</Alert>
                ) : item.hasData ? (
                  <ProfileValues values={structuredProfileEntries(item.data)} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No details have been collected for this section.
                  </Typography>
                )}
              </FormSectionCard>
            </Grid>
          );
        })}
      </Grid>
      {details.customDetailsMasked ? (
        <Alert severity="info">School-specific details are restricted by school policy.</Alert>
      ) : (
        sources.map((source) => (
          <FormSectionCard
            key={source.formInstanceId}
            icon="mdi:form-select"
            title="School details"
            description={`${source.formName} · Version ${source.formVersion}`}
            action={
              canCreate && details.customDetailsEditable && source.editableFieldCodes.length > 0 ? (
                <Button variant="outlined" onClick={onCustomChange}>
                  Request change
                </Button>
              ) : undefined
            }
          >
            <RegistrationSourceFields source={source} onHistory={onHistory} />
            {!source.isBaseline &&
              source.differences.some((difference) => difference.canReview) && (
                <Alert
                  severity="info"
                  action={
                    canCreate && details.customDetailsEditable ? (
                      <Button onClick={onCustomChange}>Review changes</Button>
                    ) : undefined
                  }
                >
                  This admission contains new details for review. Current student values have been
                  kept.
                </Alert>
              )}
          </FormSectionCard>
        ))
      )}
      {!sections.length && !sources.length && !details.customDetailsMasked && (
        <EmptyContent
          title="No profile details available"
          description="Existing details will appear here when collected."
          filled
        />
      )}
    </Stack>
  );
}
