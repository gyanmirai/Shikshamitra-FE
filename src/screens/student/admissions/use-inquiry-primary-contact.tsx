'use client';

import type { FormikProps } from 'formik';
import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { canonicalInquiryBinding } from './admission-inquiry-field-bindings';
import { getDependentAdmissionFieldCodes } from './admission-field-dependencies';
import type { AdmissionInquiryFormValues } from './admission-inquiry-model';
import { getAdmissionInquiryPrimaryContact } from './admission-inquiry-model';

export function changeInquiryPrimaryContact<T extends AdmissionInquiryFormValues>(
  values: T,
  fields: AdmissionFormField[],
  code: string,
  role: string,
  { isEditingSavedInquiry = false, confirmed = false } = {}
): T {
  const previous =
    values.fields[code]?.trim().toLowerCase() ||
    values.capturedParentRelationship ||
    values.parentRelationship;
  const resetCodes = previous !== role ? getDependentAdmissionFieldCodes(fields, code) : [];
  // Saved contact answers belong to the previous adult. New draft answers can follow a role correction.
  if (isEditingSavedInquiry && previous && previous !== role)
    resetCodes.push(
      ...fields
        .filter((field) =>
          ['Guardian.FirstName', 'Guardian.LastName', 'Guardian.Mobile', 'Guardian.Email'].includes(
            canonicalInquiryBinding(field) ?? ''
          )
        )
        .map((field) => field.code)
    );
  return {
    ...values,
    guardianResponsibilityConfirmed: role === 'guardian' && confirmed,
    fields: {
      ...values.fields,
      ...Object.fromEntries(resetCodes.map((key) => [key, ''])),
      [code]: role,
    },
  };
}

export function useInquiryPrimaryContact<T extends AdmissionInquiryFormValues>({
  formik,
  fields,
  contextKey,
  isEditingSavedInquiry = false,
  busy = false,
}: {
  formik: FormikProps<T>;
  fields: AdmissionFormField[];
  contextKey: string;
  isEditingSavedInquiry?: boolean;
  busy?: boolean;
}) {
  const [pending, setPending] = useState<{ code: string; contextKey: string } | null>(null);
  const previousContext = useRef(contextKey);
  useEffect(() => {
    if (previousContext.current !== contextKey) {
      previousContext.current = contextKey;
      setPending(null);
      if (formik.values.guardianResponsibilityConfirmed)
        formik.setFieldValue('guardianResponsibilityConfirmed', false, false);
    }
  }, [contextKey, formik]);
  const selector = fields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship'
  );
  const role = selector ? formik.values.fields[selector.code]?.trim().toLowerCase() : '';
  const applyRole = (code: string, nextRole: string, confirmed = false) => {
    formik.setValues((current) =>
      changeInquiryPrimaryContact(current, fields, code, nextRole, {
        isEditingSavedInquiry,
        confirmed,
      })
    );
  };
  const requestConfirmation = () => {
    if (
      !selector ||
      getAdmissionInquiryPrimaryContact(fields, formik.values).relationship !== 'guardian' ||
      formik.values.guardianResponsibilityConfirmed
    )
      return false;
    setPending({ code: selector.code, contextKey });
    return true;
  };
  const changeField = (field: AdmissionFormField, value: string) => {
    if (canonicalInquiryBinding(field) !== 'Inquiry.ParentRelationship') return false;
    if (busy) return true;
    const next = value.trim().toLowerCase();
    if (next === role && (next !== 'guardian' || formik.values.guardianResponsibilityConfirmed))
      return true;
    if (next === 'guardian') setPending({ code: field.code, contextKey });
    else {
      setPending(null);
      applyRole(field.code, next);
    }
    return true;
  };
  return {
    changeField,
    requestConfirmation,
    confirmation: (
      <GuardianResponsibilityConfirmation
        open={Boolean(pending && pending.contextKey === contextKey)}
        busy={busy}
        onClose={() => {
          if (!busy) setPending(null);
        }}
        onConfirm={() => {
          if (busy || !pending || pending.contextKey !== contextKey) return;
          applyRole(pending.code, 'guardian', true);
          setPending(null);
        }}
      />
    ),
  };
}

export function GuardianResponsibilityConfirmation({
  open,
  busy = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      title="Confirm Guardian Responsibility"
      icon={<Iconify icon={GlobalIcons.alertIcon} color="warning.main" width={24} />}
      content="Confirm that neither parent is handling school-contact responsibility and this guardian will be the primary contact."
      cancelText="Cancel"
      disableBackdropClick
      disableCancel={busy}
      disableEscapeKeyDown={busy}
      onClose={() => {
        if (!busy) onClose();
      }}
      action={
        <Button
          type="button"
          size="small"
          variant="contained"
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
          onClick={() => {
            if (!busy) onConfirm();
          }}
        >
          Confirm Guardian
        </Button>
      }
    />
  );
}
