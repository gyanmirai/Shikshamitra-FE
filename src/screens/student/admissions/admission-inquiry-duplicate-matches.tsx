import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { Box, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { canLinkAdmissionInquiryFamily } from './admission-inquiry-model';
import { isPossibleDuplicateInquiry } from './admission-inquiry-match-review';
import { AdmissionInquiryFamilyReview } from './admission-inquiry-family-review';
import { buildInquiryFamilyReviews } from './admission-inquiry-parent-review-model';

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
  onUseExisting: (familyId: string, sourceApplicantId: string) => void | Promise<void>;
  onOpenExisting: (inquiryId: string) => void;
};

export function AdmissionInquiryDuplicateMatches({ reviewKey, ...props }: Props) {
  const {
    matches,
    guardianPhone,
    guardianEmail,
    applicantName,
    applicantDateOfBirth,
    admissionCycleId,
    parentRelationship,
  } = props;
  // A changed identity, source or resubmission creates a fresh local review, without changing the form draft.
  const session = JSON.stringify([
    reviewKey,
    matches,
    guardianPhone,
    guardianEmail,
    applicantName,
    applicantDateOfBirth,
    admissionCycleId,
    parentRelationship,
  ]);
  return matches.length ? <InquiryMatchReview key={session} {...props} /> : null;
}

function InquiryMatchReview({
  matches,
  guardianPhone,
  guardianEmail = '',
  applicantName,
  applicantDateOfBirth,
  admissionCycleId,
  presentation = 'inline',
  busy,
  onUseExisting,
  onOpenExisting,
}: Omit<Props, 'reviewKey'>) {
  const [open, setOpen] = useState(true);
  const [reviewDifferentChild, setReviewDifferentChild] = useState(false);
  const inFlight = useRef(false);
  const duplicate = matches.find((match) =>
    isPossibleDuplicateInquiry(match, {
      applicantName,
      applicantDateOfBirth,
      admissionCycleId,
    })
  );
  const families = buildInquiryFamilyReviews(
    matches.filter((match) => canLinkAdmissionInquiryFamily(match, guardianPhone, guardianEmail))
  );
  const formik = useFormik({
    initialValues: { family: families.length === 1 ? families[0].familyId : '' },
    validationSchema: Yup.object({
      family: Yup.string()
        .oneOf(families.map((family) => family.familyId))
        .required('Select a family.'),
    }),
    onSubmit: async (values) => {
      if (busy || inFlight.current || (duplicate && !reviewDifferentChild)) return;
      const family = families.find((item) => item.familyId === values.family);
      const source = family?.children[0];
      if (!family || !source) return;
      inFlight.current = true;
      try {
        await onUseExisting(family.familyId, source.applicantId);
      } finally {
        inFlight.current = false;
      }
    },
  });
  const selectedFamily = families.find((family) => family.familyId === formik.values.family);
  const locked = busy || formik.isSubmitting;
  const canConfirm = Boolean(
    selectedFamily?.children.length && (!duplicate || reviewDifferentChild)
  );
  const close = () => {
    if (!locked && !inFlight.current) setOpen(false);
  };
  const content = (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {applicantName && (
        <Typography variant="body2">
          Inquiry: <strong>{applicantName}</strong>
        </Typography>
      )}
      {duplicate && !reviewDifferentChild && (
        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="body2" color="warning.main">
            An inquiry with this student name already exists. Review it before adding another child.
          </Typography>
          {duplicate.existingInquiryId && (
            <Button
              type="button"
              size="small"
              variant="outlined"
              disabled={locked}
              onClick={() => onOpenExisting(duplicate.existingInquiryId!)}
              startIcon={<Iconify icon={GlobalIcons.eye} width={18} />}
            >
              Open Existing Inquiry
            </Button>
          )}
          <Button
            type="button"
            size="small"
            disabled={locked}
            onClick={() => setReviewDifferentChild(true)}
          >
            Different Child? Review Siblings
          </Button>
        </Stack>
      )}
      {(!duplicate || reviewDifferentChild) && (
        <AdmissionInquiryFamilyReview
          families={families}
          selectedFamily={selectedFamily}
          disabled={locked}
          onSelect={(familyId) => formik.setFieldValue('family', familyId)}
          error={formik.submitCount ? formik.errors.family : undefined}
        />
      )}
    </Stack>
  );
  const actions = (
    <DialogActions disableSpacing sx={{ flexWrap: 'wrap', gap: 1 }}>
      <Button
        type="button"
        size="small"
        variant="outlined"
        disabled={locked}
        onClick={close}
        startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
      >
        Cancel
      </Button>
      <LoadingButton
        type="button"
        size="small"
        variant="contained"
        color="inherit"
        loading={locked}
        disabled={locked || !canConfirm}
        onClick={() => formik.submitForm()}
        startIcon={<Iconify icon={GlobalIcons.assigned} width={18} />}
      >
        Confirm siblings
      </LoadingButton>
    </DialogActions>
  );
  if (!open) return null;
  return (
    <>
      <Box
        role="status"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {families.length} possible existing {families.length === 1 ? 'family' : 'families'} found.
        Review the siblings to link.
      </Box>
      {presentation === 'dialog' ? (
        <CustomDialog
          open
          title="Confirm Siblings"
          titleInfo="Link this inquiry with the children in the selected family."
          handleClose={close}
          maxWidth="xs"
          hasForm={false}
          guardUnsavedChanges={false}
          disableClose={locked}
          aria-busy={locked}
        >
          <DialogScrollContent>{content}</DialogScrollContent>
          {actions}
        </CustomDialog>
      ) : (
        <Stack spacing={2}>
          {content}
          {actions}
        </Stack>
      )}
    </>
  );
}
