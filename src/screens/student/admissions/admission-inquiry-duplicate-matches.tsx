import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionSiblingParentSelection } from 'src/redux/student/admissions/admission-parent-family-types';

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
import { buildInquiryFamilyReviews } from './admission-inquiry-parent-review-model';
import {
  AdmissionInquiryParentReview,
  AdmissionInquiryContactMatch,
} from './admission-inquiry-parent-review';

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
  parentRelationship,
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
    matches.filter((match) => canLinkAdmissionInquiryFamily(match, guardianPhone, guardianEmail)),
    parentRelationship
  );
  const options = families.flatMap((family) => family.parents);
  const formik = useFormik({
    initialValues: { parent: options.length === 1 ? options[0].key : '', relationship: '' },
    validationSchema: Yup.object({
      parent: Yup.string()
        .oneOf(options.map((option) => option.key))
        .required('Select a parent.'),
      relationship: Yup.string().when('parent', {
        is: (key: string) =>
          options.some((option) => option.key === key && !option.parent.relationship),
        then: (schema) => schema.oneOf(['father', 'mother']).required('Select Father or Mother.'),
      }),
    }),
    onSubmit: async (values) => {
      if (busy || inFlight.current || (duplicate && !reviewDifferentChild)) return;
      const option = options.find((item) => item.key === values.parent);
      const relationship = option?.parent.relationship ?? values.relationship;
      if (!option || (relationship !== 'father' && relationship !== 'mother')) return;
      inFlight.current = true;
      try {
        await onUseExisting(option.match.familyId, { ...option.parent, relationship });
      } finally {
        inFlight.current = false;
      }
    },
  });
  const selected = options.find((option) => option.key === formik.values.parent);
  const relationship = selected?.parent.relationship ?? formik.values.relationship;
  const locked = busy || formik.isSubmitting;
  const canConfirm = Boolean(
    selected && ['father', 'mother'].includes(relationship) && (!duplicate || reviewDifferentChild)
  );
  const close = () => {
    if (!locked && !inFlight.current) setOpen(false);
  };
  const content = (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {applicantName && (
        <Typography variant="body2">
          New inquiry: <strong>{applicantName}</strong>
        </Typography>
      )}
      <AdmissionInquiryContactMatch matches={matches} phone={guardianPhone} email={guardianEmail} />
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
            Different Child? Review Parent
          </Button>
        </Stack>
      )}
      {(!duplicate || reviewDifferentChild) && (
        <AdmissionInquiryParentReview
          families={families}
          selected={selected}
          disabled={locked}
          enteredMobile={guardianPhone}
          onSelect={(option) => formik.setValues({ parent: option.key, relationship: '' })}
          relationship={formik.values.relationship}
          onRelationshipChange={(value) => formik.setFieldValue('relationship', value)}
          relationshipError={formik.submitCount ? formik.errors.relationship : undefined}
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
        startIcon={<Iconify icon={GlobalIcons.edit} width={18} />}
      >
        Edit Contact Details
      </Button>
      <LoadingButton
        type="button"
        size="small"
        variant="contained"
        color="inherit"
        loading={locked}
        disabled={locked || !canConfirm}
        onClick={() => formik.submitForm()}
        startIcon={<Iconify icon={GlobalIcons.addIcon} width={18} />}
      >
        Add as Sibling
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
        Check the saved parent details.
      </Box>
      {presentation === 'dialog' ? (
        <CustomDialog
          open
          title="Check Parent Details"
          titleInfo="Check the saved parent and children. Add as Sibling reuses this parent for the new inquiry."
          handleClose={close}
          maxWidth="sm"
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
