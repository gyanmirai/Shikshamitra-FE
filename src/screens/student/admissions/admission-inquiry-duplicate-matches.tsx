import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionSiblingParentSelection } from 'src/redux/student/admissions/admission-parent-family-types';

import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, TextField, Typography } from '@mui/material';

import { formatAdmissionReference } from './admission-reference';
import { canLinkAdmissionInquiryFamily } from './admission-inquiry-model';
import { AdmissionSiblingFamilyMatch } from './admission-sibling-family-match';

type Props = {
  matches: DuplicateMatch[];
  guardianPhone: string;
  guardianEmail?: string;
  busy: boolean;
  onUseExisting: (
    familyId: string,
    parent: AdmissionSiblingParentSelection
  ) => void | Promise<void>;
  onOpenExisting: (inquiryId: string) => void;
  onCreateSeparate: () => void;
  overrideReason: string;
  onOverrideReasonChange: (value: string) => void;
};

export function AdmissionInquiryDuplicateMatches({
  matches,
  guardianPhone,
  guardianEmail = '',
  busy,
  onUseExisting,
  onOpenExisting,
  onCreateSeparate,
  overrideReason,
  onOverrideReasonChange,
}: Props) {
  if (!matches.length) return null;
  return (
    <Stack spacing={1}>
      {matches.map((match) => {
        const canLink = canLinkAdmissionInquiryFamily(match, guardianPhone, guardianEmail);
        return (
          <StudentFeedback
            notificationKey="STU-0071"
            presentation="persistent"
            key={`${match.familyId}-${match.applicantId}`}
            severity="warning"
            action={
              <Stack direction="row" spacing={0.5}>
                {match.existingInquiryId && (
                  <Button
                    size="small"
                    disabled={busy}
                    onClick={() => onOpenExisting(match.existingInquiryId!)}
                  >
                    Open inquiry
                  </Button>
                )}
              </Stack>
            }
          >
            Possible existing family: {match.applicantName} ·{' '}
            {match.guardianEmail || match.guardianPhone || '—'}
            {match.existingInquiryNumber
              ? ` · ${formatAdmissionReference(match.existingInquiryNumber)}`
              : ''}
            {!canLink && (
              <Typography variant="body2">
                {match.canLinkFamily === false && match.guardianPhone === guardianPhone
                  ? 'This family is not available for linking. Review the existing inquiry or create a separate family.'
                  : 'Parent contact details do not match. Check the email or mobile before adding a sibling.'}
              </Typography>
            )}
            <AdmissionSiblingFamilyMatch
              key={`${match.familyId}:${guardianPhone}:${guardianEmail}`}
              parents={match.parents ?? []}
              children={match.applicantName}
              busy={busy}
              enteredMobile={guardianPhone}
              disabled={!canLink}
              mobileDiffers={match.matchByEmail === true && match.matchByMobile !== true}
              onConfirm={(parent) => onUseExisting(match.familyId, parent)}
            />
          </StudentFeedback>
        );
      })}
      <TextField
        fullWidth
        size="small"
        multiline
        minRows={2}
        label="Reason for creating a separate family"
        required
        value={overrideReason}
        onChange={(event) => onOverrideReasonChange(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 512 } }}
        helperText="Explain why this inquiry belongs to a separate family. Use Add sibling for another child in the same family."
      />
      <Button
        type="button"
        size="small"
        variant="outlined"
        disabled={busy || !overrideReason.trim()}
        onClick={onCreateSeparate}
      >
        Create separate family
      </Button>
    </Stack>
  );
}
