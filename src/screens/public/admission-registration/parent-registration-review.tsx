import type { PublicParentRegistrationContext } from 'src/redux/student/admissions/admission-parent-registration-types';
import type { CorrectionSection } from 'src/screens/student/admissions/application-detail/application-form-correction-visibility';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

import { readableRegistrationValue, registrationDocumentStatus } from './parent-registration-model';

export function ParentRegistrationReview({
  context,
  sections,
  mobile,
  onEditSection,
  canEditSection,
  onOpenDocuments,
}: {
  context: PublicParentRegistrationContext;
  sections: CorrectionSection[];
  mobile: boolean;
  onEditSection?: (sectionId: string) => void;
  canEditSection: (sectionId: string) => boolean;
  onOpenDocuments?: () => void;
}) {
  const sent = context.status === 'ReadyForReview';
  const canEditDocuments = context.canEdit && context.documents.some(({ canUpload }) => canUpload);
  const summarySections = sections.filter(({ rows }) =>
    rows.some(({ fields }) => fields.some((field) => field.fieldType !== 12))
  );

  return (
    <Stack spacing={2}>
      {(!context.canEdit || mobile) && (
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              component={mobile ? 'h1' : 'h2'}
              variant="h5"
              role={context.canEdit ? undefined : 'status'}
            >
              {context.canEdit
                ? 'Review and Send'
                : sent
                  ? 'Sent to school'
                  : 'Registration is read only'}
            </Typography>
            {context.canEdit && mobile && (
              <InfoTooltipIcon
                title="Check your answers and documents before sending to the school."
                label="Review and Send information"
              />
            )}
          </Stack>
          {sent && (
            <Typography variant="body2" color="text.secondary">
              The school will review your answers and documents. Contact the school if another
              correction is needed.
            </Typography>
          )}
        </Stack>
      )}
      <Stack spacing={1.5}>
        {summarySections.map(({ section, count, rows }) => (
          <FormSectionCard
            key={section.id}
            title={section.name}
            icon={mobile ? undefined : GlobalIcons.admissionDetails}
            description={sectionSummary(section.isRepeatable, count, rows)}
            descriptionTooltip={
              mobile ? undefined : 'Review the saved answers sent to your school.'
            }
            collapsible
            defaultExpanded={false}
            contentSpacing={1}
            action={
              onEditSection &&
              canEditSection(section.id) &&
              rows.some(({ fields }) => fields.some((field) => !field.readOnly)) && (
                <Button
                  size="small"
                  aria-label={`Edit ${section.name}`}
                  startIcon={<Iconify icon={GlobalIcons.edit} width={16} />}
                  onClick={() => onEditSection(section.id)}
                >
                  Edit
                </Button>
              )
            }
          >
            {section.isRepeatable && count === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No entries added.
              </Typography>
            ) : (
              rows.map(({ index, fields, values }) => (
                <Stack key={index} spacing={1}>
                  {section.isRepeatable && (
                    <Typography variant="subtitle2">
                      {section.entryLabel || 'Entry'} {index + 1}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1,
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        sm: mobile ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))',
                      },
                    }}
                  >
                    {fields
                      .filter((field) => field.fieldType !== 12)
                      .map((field) => (
                        <Box key={field.id} sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary">
                            {field.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
                          >
                            {readableRegistrationValue(values[field.code] ?? '', field.optionsJson)}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                </Stack>
              ))
            )}
          </FormSectionCard>
        ))}
        {context.documents.length > 0 && (
          <FormSectionCard
            title="Documents"
            icon={mobile ? undefined : GlobalIcons.documentIcon}
            descriptionTooltip={
              mobile ? undefined : 'Uploaded copies are reviewed by school staff.'
            }
            description={`${context.documents.filter(({ evidence }) => evidence.length > 0).length} of ${context.documents.length} uploaded`}
            collapsible
            defaultExpanded={false}
            contentSpacing={1}
            action={
              onOpenDocuments && (
                <Button
                  size="small"
                  aria-label={canEditDocuments ? 'Edit Documents' : 'View Documents'}
                  onClick={onOpenDocuments}
                  startIcon={
                    <Iconify
                      icon={canEditDocuments ? GlobalIcons.edit : GlobalIcons.eye}
                      width={16}
                    />
                  }
                >
                  {canEditDocuments ? 'Edit' : 'View'}
                </Button>
              )
            }
          >
            {context.documents.map((document) => {
              const status = registrationDocumentStatus(document);
              const file = document.evidence.at(-1);
              return (
                <Box
                  key={`${document.stageInstanceId}/${document.code}`}
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  <Typography variant="body2">
                    {document.name} ·{' '}
                    <Box component="span" sx={{ color: status.color }}>
                      {status.label}
                    </Box>
                  </Typography>
                  {file && (
                    <Typography variant="caption" color="text.secondary">
                      {file.fileName}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </FormSectionCard>
        )}
        {summarySections.length === 0 && context.documents.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            There are no answers or documents to review.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

function sectionSummary(
  repeatable: boolean | undefined,
  count: number,
  rows: CorrectionSection['rows']
) {
  if (repeatable) return `${count} ${count === 1 ? 'entry' : 'entries'} added`;

  const summaryValues = (rows[0]?.fields ?? [])
    .filter((field) => field.fieldType !== 12)
    .map((field) => readableRegistrationValue(rows[0]?.values[field.code] ?? '', field.optionsJson))
    .filter((value) => value && value !== '—')
    .slice(0, 2);

  return summaryValues.length ? summaryValues.join(' · ') : 'No details added';
}
