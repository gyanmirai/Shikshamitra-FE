import type { ReactNode } from 'react';
import type {
  AdmissionFamilyParent,
  AdmissionSiblingParentSelection,
} from 'src/redux/student/admissions/admission-parent-family-types';

import * as Yup from 'yup';
import { useRef } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Button, Divider, Typography } from '@mui/material';

type Props = {
  parents: AdmissionFamilyParent[];
  children: string;
  busy: boolean;
  disabled?: boolean;
  mobileDiffers?: boolean;
  enteredMobile?: string;
  layout?: 'stacked' | 'inquiry';
  secondaryAction?: ReactNode;
  onConfirm: (parent: AdmissionSiblingParentSelection) => void | Promise<void>;
};

const parentKey = (parent: AdmissionFamilyParent) =>
  `${parent.sourceApplicantId}:${parent.relationship ?? 'parent'}`;

export function AdmissionSiblingFamilyMatch({
  parents,
  children,
  busy,
  disabled = false,
  mobileDiffers = false,
  enteredMobile,
  layout = 'stacked',
  secondaryAction,
  onConfirm,
}: Props) {
  const confirmation = useBoolean();
  const confirming = useBoolean();
  const confirmationInFlight = useRef(false);
  const eligibleParents = parents.filter(
    (parent) => parent.relationship == null || ['father', 'mother'].includes(parent.relationship)
  );
  const formik = useFormik({
    initialValues: { parent: '', relationship: '' },
    validationSchema: Yup.object({
      parent: Yup.string()
        .oneOf(eligibleParents.map(parentKey), 'Select an available parent.')
        .required('Select a parent.'),
      relationship: Yup.string().when('parent', {
        is: (key: string) =>
          eligibleParents.some((parent) => parentKey(parent) === key && !parent.relationship),
        then: (value) =>
          value
            .oneOf(['father', 'mother'], 'Select Father or Mother.')
            .required('Select Father or Mother.'),
      }),
    }),
    onSubmit: async () => confirmation.onTrue(),
  });
  const selected = eligibleParents.find((parent) => parentKey(parent) === formik.values.parent);
  const locked = busy || formik.isSubmitting || confirming.value;
  const showError = Boolean(
    (formik.touched.parent || formik.submitCount > 0) && formik.errors.parent
  );
  const inquiryLayout = layout === 'inquiry';

  return (
    <Stack spacing={inquiryLayout ? 2 : 1} sx={{ minWidth: 0 }}>
      {!inquiryLayout && <Typography variant="body2">Existing family · {children}</Typography>}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: inquiryLayout
            ? { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }
            : 'minmax(0, 1fr)',
          gap: 2,
        }}
      >
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <ShakingTextField error={showError}>
            <CustomSelect
              name="siblingParent"
              label="Parent"
              required
              size="small"
              fullWidth
              disabled={locked || disabled || !eligibleParents.length}
              value={formik.values.parent}
              onChange={(value) => formik.setFieldValue('parent', String(value))}
              onBlur={() => formik.setFieldTouched('parent', true)}
              options={eligibleParents.map((parent) => ({
                value: parentKey(parent),
                label: `${parent.relationship === 'father' ? 'Father' : parent.relationship === 'mother' ? 'Mother' : 'Parent'} · ${parent.name}${!inquiryLayout && parent.email ? ` · ${parent.email}` : ''}`,
              }))}
              error={showError}
              helperText={showError ? formik.errors.parent : undefined}
            />
          </ShakingTextField>
          {selected && !selected.relationship && (
            <ShakingTextField error={Boolean(formik.submitCount && formik.errors.relationship)}>
              <CustomSelect
                name="siblingParentRelationship"
                label="Relationship"
                required
                fullWidth
                size="small"
                disabled={locked}
                value={formik.values.relationship}
                onChange={(value) => formik.setFieldValue('relationship', String(value))}
                options={[
                  { value: 'father', label: 'Father' },
                  { value: 'mother', label: 'Mother' },
                ]}
                error={Boolean(formik.submitCount && formik.errors.relationship)}
                helperText={formik.submitCount ? formik.errors.relationship : undefined}
              />
            </ShakingTextField>
          )}
          {selected && (
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {[selected.email, selected.mobile].filter(Boolean).join(' · ')}
            </Typography>
          )}
          {!eligibleParents.length && (
            <Typography variant="body2" color="text.secondary">
              No Father or Mother contact is available for this family.
            </Typography>
          )}
        </Stack>
        {inquiryLayout && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Iconify
              icon={GlobalIcons.family}
              width={24}
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            />
            <Box>
              <Typography variant="subtitle2">Same family, a new inquiry</Typography>
              <Typography variant="body2" color="text.secondary">
                Saved parent details stay unchanged.
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>
      {inquiryLayout && <Divider />}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={
          secondaryAction ? 'space-between' : inquiryLayout ? 'flex-end' : 'flex-start'
        }
        spacing={1}
        useFlexGap
        flexWrap="wrap"
      >
        {secondaryAction}
        <Button
          type="button"
          size="small"
          variant={inquiryLayout ? 'contained' : 'outlined'}
          color="inherit"
          disabled={locked || disabled || !eligibleParents.length}
          startIcon={<Iconify icon={GlobalIcons.addIcon} width={18} />}
          onClick={() => formik.submitForm()}
        >
          Add sibling
        </Button>
      </Stack>
      <ConfirmDialog
        open={confirmation.value && Boolean(selected)}
        title="Add Sibling?"
        icon={<Iconify icon={GlobalIcons.assigned} width={24} color="info.main" />}
        disableCancel={locked}
        disableEscapeKeyDown={locked}
        onClose={() => {
          if (!locked) confirmation.onFalse();
        }}
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              Confirm this child belongs to {selected?.name}’s family. Saved parent details will be
              reused without changing the existing parent record.
            </Typography>
            {(mobileDiffers ||
              Boolean(
                selected?.mobile &&
                enteredMobile &&
                selected.mobile.replace(/\D/g, '') !== enteredMobile.replace(/\D/g, '')
              )) && (
              <Typography variant="body2" color="warning.main">
                The entered mobile differs. Verify the family before continuing.
              </Typography>
            )}
          </Stack>
        }
        action={
          <LoadingButton
            type="button"
            size="small"
            variant="contained"
            color="inherit"
            loading={busy || confirming.value}
            disabled={locked || !selected}
            startIcon={<Iconify icon={GlobalIcons.addIcon} width={18} />}
            onClick={async () => {
              if (locked || !selected || confirmationInFlight.current) return;
              const relationship = selected.relationship ?? formik.values.relationship;
              if (relationship !== 'father' && relationship !== 'mother') return;
              confirmationInFlight.current = true;
              confirming.onTrue();
              try {
                await onConfirm({ ...selected, relationship });
                confirmation.onFalse();
              } finally {
                confirmationInFlight.current = false;
                confirming.onFalse();
              }
            }}
          >
            Add sibling
          </LoadingButton>
        }
      />
    </Stack>
  );
}
