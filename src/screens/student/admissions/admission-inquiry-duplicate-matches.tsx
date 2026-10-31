import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionSiblingParentSelection } from 'src/redux/student/admissions/admission-parent-family-types';

import { useId, useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Avatar,
  Button,
  Divider,
  Collapse,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { formatAdmissionReference } from './admission-reference';
import { canLinkAdmissionInquiryFamily } from './admission-inquiry-model';
import { isPossibleDuplicateInquiry } from './admission-inquiry-match-review';
import { AdmissionSiblingFamilyMatch } from './admission-sibling-family-match';

type Props = {
  matches: DuplicateMatch[];
  guardianPhone: string;
  guardianEmail?: string;
  applicantName?: string;
  applicantDateOfBirth?: string | null;
  admissionCycleId?: string;
  parentRelationship?: 'father' | 'mother' | 'guardian';
  presentation?: 'inline' | 'dialog';
  reviewKey?: number;
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
  applicantName,
  applicantDateOfBirth,
  admissionCycleId,
  parentRelationship,
  presentation = 'inline',
  reviewKey,
  busy,
  onUseExisting,
  onOpenExisting,
  onCreateSeparate,
  overrideReason,
  onOverrideReasonChange,
}: Props) {
  const [showSeparateFamily, setShowSeparateFamily] = useState(false);
  const [dismissedReview, setDismissedReview] = useState('');
  const [expandedMatches, setExpandedMatches] = useState<string[]>([]);
  const separateFamilyId = useId();
  const reviewSession = JSON.stringify([
    applicantName,
    applicantDateOfBirth,
    admissionCycleId,
    parentRelationship,
    guardianPhone,
    guardianEmail,
    reviewKey,
    matches.map((match) => [match.applicantId, match.familyId, match.existingInquiryId]),
  ]);
  const possibleDuplicate = (match: DuplicateMatch) =>
    isPossibleDuplicateInquiry(match, {
      applicantName,
      applicantDateOfBirth,
      admissionCycleId,
    });
  const reviewTitle =
    matches.length === 1 && possibleDuplicate(matches[0])
      ? 'Possible Duplicate Inquiry'
      : matches.length > 1
        ? 'Possible Family Matches'
        : 'Existing Family Found';
  const closeReview = () => {
    if (!busy) setDismissedReview(reviewSession);
  };
  const separateFamilyToggle = (
    <Button
      type="button"
      size="small"
      color="inherit"
      disabled={busy}
      aria-expanded={showSeparateFamily}
      aria-controls={separateFamilyId}
      onClick={() => setShowSeparateFamily((value) => !value)}
    >
      Different family?
    </Button>
  );
  const reviewContent =
    matches.length > 0 ? (
      <FormSectionCard
        title={presentation === 'dialog' ? 'Match Details' : reviewTitle}
        icon={GlobalIcons.family}
        descriptionTooltip="Review the saved parent before adding this child as a sibling. A contact match does not link the family automatically."
        sx={{ minWidth: 0 }}
      >
        {applicantName && (
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            New inquiry: {applicantName}
          </Typography>
        )}
        {matches.map((match, index) => {
          const canLink = canLinkAdmissionInquiryFamily(match, guardianPhone, guardianEmail);
          const duplicate = possibleDuplicate(match);
          const matchKey = `${reviewSession}:${match.applicantId}:${match.familyId}`;
          const reviewSibling = !duplicate || expandedMatches.includes(matchKey);
          return (
            <Stack key={`${match.familyId}-${match.applicantId}`} spacing={2} sx={{ minWidth: 0 }}>
              {index > 0 && <Divider />}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ sm: 'center' }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Avatar sx={{ bgcolor: 'background.neutral', color: 'text.secondary' }}>
                    <Iconify icon={GlobalIcons.admissionStudent} width={22} />
                  </Avatar>
                  <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                    <Typography variant="subtitle2">{match.applicantName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[
                        match.existingInquiryNumber
                          ? formatAdmissionReference(match.existingInquiryNumber)
                          : null,
                        match.guardianPhone,
                        match.guardianEmail,
                        match.dateOfBirth ? `DOB: ${fDate(match.dateOfBirth.slice(0, 10))}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Existing family'}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                  <Label color={duplicate || !canLink ? 'warning' : 'info'}>
                    {duplicate ? 'Possible duplicate' : canLink ? 'Contact match' : 'Review needed'}
                  </Label>
                  {match.existingInquiryId && (
                    <Button
                      type="button"
                      size="small"
                      variant={duplicate ? 'contained' : 'outlined'}
                      color="inherit"
                      disabled={busy}
                      startIcon={<Iconify icon={GlobalIcons.eye} width={18} />}
                      onClick={() => onOpenExisting(match.existingInquiryId!)}
                    >
                      {duplicate ? 'Open existing inquiry' : 'Open inquiry'}
                    </Button>
                  )}
                </Stack>
              </Stack>
              <Divider />
              {duplicate && (
                <Stack spacing={1} alignItems="flex-start">
                  <Typography variant="body2">
                    This student name matches an inquiry in the selected admission period. Review
                    the saved inquiry before creating another.
                  </Typography>
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    disabled={busy}
                    aria-expanded={reviewSibling}
                    onClick={() =>
                      setExpandedMatches((current) =>
                        reviewSibling
                          ? current.filter((key) => key !== matchKey)
                          : [...current, matchKey]
                      )
                    }
                  >
                    Different child? Review family
                  </Button>
                </Stack>
              )}
              {!canLink && (
                <Typography variant="body2" color="text.secondary">
                  {match.canLinkFamily === false && match.guardianPhone === guardianPhone
                    ? 'This family is not available for linking. Review the existing inquiry or create a separate family.'
                    : 'Parent contact details do not match. Check the email or mobile before adding a sibling.'}
                </Typography>
              )}
              {reviewSibling && (
                <AdmissionSiblingFamilyMatch
                  key={`${match.familyId}:${guardianPhone}:${guardianEmail}`}
                  parents={(match.parents ?? []).filter(
                    (parent) =>
                      !parentRelationship ||
                      parentRelationship === 'guardian' ||
                      !parent.relationship ||
                      parent.relationship === parentRelationship
                  )}
                  children={match.applicantName}
                  busy={busy}
                  enteredMobile={guardianPhone}
                  layout="inquiry"
                  secondaryAction={matches.length === 1 ? separateFamilyToggle : undefined}
                  disabled={!canLink || parentRelationship === 'guardian'}
                  disabledReason={
                    parentRelationship === 'guardian'
                      ? 'Sibling linking requires Father or Mother as the primary contact.'
                      : undefined
                  }
                  mobileDiffers={match.matchByEmail === true && match.matchByMobile !== true}
                  onConfirm={(parent) => onUseExisting(match.familyId, parent)}
                />
              )}
            </Stack>
          );
        })}
        {matches.length > 1 && <Box>{separateFamilyToggle}</Box>}
        <Collapse in={showSeparateFamily} unmountOnExit>
          <Stack id={separateFamilyId} spacing={2}>
            <Divider />
            <ShakingTextField>
              <TextField
                name="duplicateOverrideReason"
                fullWidth
                size="small"
                multiline
                minRows={2}
                label="Reason for creating a separate family"
                required
                value={overrideReason}
                disabled={busy}
                onChange={(event) => onOverrideReasonChange(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 512 } }}
                helperText="Explain why this inquiry belongs to a separate family. Use Add sibling for another child in the same family."
              />
            </ShakingTextField>
            <Stack direction="row" justifyContent="flex-end">
              <Button
                type="button"
                size="small"
                variant="outlined"
                color="inherit"
                disabled={busy || !overrideReason.trim()}
                onClick={() => {
                  if (!busy && overrideReason.trim()) onCreateSeparate();
                }}
              >
                Create separate family
              </Button>
            </Stack>
          </Stack>
        </Collapse>
      </FormSectionCard>
    ) : null;
  return (
    <>
      <Box
        role="status"
        aria-atomic="true"
        sx={{
          border: 0,
          m: -1,
          p: 0,
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          position: 'absolute',
          whiteSpace: 'nowrap',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {matches.length > 0 &&
          `${matches.length} possible existing ${matches.length === 1 ? 'family' : 'families'} found. Review the saved parent before adding a sibling.`}
      </Box>
      {presentation === 'dialog' && matches.length > 0 ? (
        <CustomDialog
          open={Boolean(matches.length) && dismissedReview !== reviewSession}
          handleClose={closeReview}
          title={reviewTitle}
          titleInfo="Review the existing inquiry or explicitly confirm the saved parent before adding a sibling."
          maxWidth="sm"
          hasForm={false}
          guardUnsavedChanges={false}
          disableClose={busy}
          aria-busy={busy}
        >
          <DialogScrollContent>{reviewContent}</DialogScrollContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              size="small"
              variant="outlined"
              disabled={busy}
              onClick={closeReview}
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            >
              Back to form
            </Button>
          </DialogActions>
        </CustomDialog>
      ) : (
        reviewContent
      )}
    </>
  );
}
