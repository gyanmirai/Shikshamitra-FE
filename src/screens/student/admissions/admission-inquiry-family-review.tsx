import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { AdmissionInquirySavedParent } from './admission-inquiry-parent-review';
import { inquiryContactMatches } from './admission-inquiry-parent-review-model';

import type { InquiryFamilyReview } from './admission-inquiry-parent-review-model';

type Props = {
  families: InquiryFamilyReview[];
  selectedFamily?: InquiryFamilyReview;
  onSelect: (familyId: string) => void;
  disabled: boolean;
  error?: string;
  guardianPhone: string;
  guardianEmail?: string;
  currentChild?: Pick<AdmissionInquiry, 'applicantId' | 'applicantName' | 'inquiryNumber'>;
  linked?: boolean;
};

/** Family selection is explicit; children are read-only context for the link. */
export function AdmissionInquiryFamilyReview({
  families,
  selectedFamily,
  onSelect,
  disabled,
  error,
  guardianPhone,
  guardianEmail = '',
  currentChild,
  linked = false,
}: Props) {
  const contactMatches = inquiryContactMatches(
    selectedFamily?.children ?? families.flatMap((family) => family.children),
    guardianPhone,
    guardianEmail
  );
  const mobileMatches = contactMatches.some((contact) => contact.byPhone);
  const emailMatches = contactMatches.some((contact) => contact.byEmail);
  const matchingContacts =
    mobileMatches && emailMatches
      ? 'The parent mobile number and email address match'
      : mobileMatches
        ? 'The parent mobile number matches'
        : emailMatches
          ? 'The parent email address matches'
          : '';
  const contactMessage = matchingContacts
    ? `${matchingContacts}${selectedFamily ? '' : ' existing records'}.`
    : '';
  const singleChild = selectedFamily?.children.length === 1;
  const message = [
    singleChild ? 'We found a possible sibling.' : 'We found possible siblings.',
    contactMessage,
    singleChild
      ? 'Confirm both children belong to the same family.'
      : 'Confirm the children belong to the same family.',
  ]
    .filter(Boolean)
    .join(' ');
  const labels = families.map((family) =>
    family.children.map((child) => child.applicantName).join(', ')
  );
  const references = families.map((family) =>
    [...new Set(family.children.map((child) => child.existingInquiryNumber).filter(Boolean))].join(
      ', '
    )
  );
  const options = families.map((family, index) => {
    const label = labels[index];
    if (!labels.some((other, otherIndex) => otherIndex !== index && other === label))
      return { value: family.familyId, label };
    const reference = references[index];
    const repeatedReference = references.some(
      (other, otherIndex) =>
        otherIndex !== index && labels[otherIndex] === label && other === reference
    );
    const detail = reference && !repeatedReference ? reference : family.familyId;
    return { value: family.familyId, label: `${label} · ${detail}` };
  });
  const children = selectedFamily?.children ?? [];
  const reviewedChildren = currentChild
    ? [
        {
          applicantId: currentChild.applicantId,
          applicantName: currentChild.applicantName,
          existingInquiryNumber: currentChild.inquiryNumber,
        },
        ...children.filter((child) => child.applicantId !== currentChild.applicantId),
      ].sort((left, right) => left.applicantName.localeCompare(right.applicantName))
    : children;
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {linked ? (
        <Box>
          <Label color="success">Siblings linked</Label>
        </Box>
      ) : (
        families.length > 0 && <Typography variant="body2">{message}</Typography>
      )}
      {families.length > 1 && (
        <ShakingTextField error={Boolean(error)}>
          <CustomSelect
            name="inquirySiblingFamily"
            label="Family"
            required
            fullWidth
            size="small"
            value={selectedFamily?.familyId ?? ''}
            disabled={disabled}
            options={options}
            onChange={(value) => onSelect(String(value))}
            error={Boolean(error)}
            helperText={error}
          />
        </ShakingTextField>
      )}
      {currentChild && selectedFamily && (
        <Stack spacing={1}>
          <Typography variant="subtitle2">Saved parent details</Typography>
          {selectedFamily.parents.map(({ key, parent }) => (
            <AdmissionInquirySavedParent key={key} parent={parent} />
          ))}
          {!selectedFamily.parents.length && (
            <Typography variant="body2" color="text.secondary">
              Saved parent details are unavailable for this family.
            </Typography>
          )}
        </Stack>
      )}
      {selectedFamily && (
        <Box
          component="ul"
          aria-label="Children in this family"
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {reviewedChildren.map((child) => (
            <Stack
              component="li"
              key={child.applicantId}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                py: 1,
                minWidth: 0,
                '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  color: 'text.secondary',
                }}
              >
                <Iconify icon={GlobalIcons.studentProfile} width={20} aria-hidden="true" />
              </Box>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {child.applicantName}
                </Typography>
                {child.existingInquiryNumber && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {child.existingInquiryNumber}
                  </Typography>
                )}
              </Stack>
            </Stack>
          ))}
        </Box>
      )}
    </Stack>
  );
}
