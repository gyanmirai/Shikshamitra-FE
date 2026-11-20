import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { InquiryFamilyReview } from './admission-inquiry-parent-review-model';

type Props = {
  families: InquiryFamilyReview[];
  selectedFamily?: InquiryFamilyReview;
  onSelect: (familyId: string) => void;
  disabled: boolean;
  error?: string;
};

/** Family selection is explicit; children are read-only context for the link. */
export function AdmissionInquiryFamilyReview({
  families,
  selectedFamily,
  onSelect,
  disabled,
  error,
}: Props) {
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
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {families.length > 0 && (
        <Typography variant="body2">
          {selectedFamily?.children.length === 1
            ? 'We found a possible sibling. Confirm both children belong to the same family.'
            : 'We found possible siblings. Confirm the children belong to the same family.'}
        </Typography>
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
      {selectedFamily && (
        <Box
          component="ul"
          aria-label="Children in this family"
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {selectedFamily.children.map((child) => (
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
