'use client';

import { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import {
  useGetAdmissionOfferingQuery,
  useGetAdmissionOfferingsQuery,
} from 'src/redux/student/admissions/admission-offerings-api';
import {
  Alert,
  Stack,
  Button,
  Dialog,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import {
  type DuplicateMatch,
  type AdmissionInquirySource,
  type CreateAdmissionInquiry,
  useCreateAdmissionInquiryMutation,
  useCheckAdmissionInquiryDuplicatesMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

type Props = {
  open: boolean;
  onClose: () => void;
  cycles?: AdmissionCycle[];
  cyclesLoading?: boolean;
  cyclesError?: boolean;
};
const sourceOptions = [
  'Website',
  'Walk-in',
  'Phone',
  'Referral',
  'Campaign',
  'Import',
  'WhatsApp',
  'Existing parent',
  'Manual',
  'Other',
];
const jsonValue = (value: string) => JSON.stringify(value);
export default function AdmissionInquiryDialog({
  open,
  onClose,
  cycles = [],
  cyclesLoading = false,
  cyclesError = false,
}: Props) {
  const [cycleId, setCycleId] = useState('');
  const [offeringId, setOfferingId] = useState('');
  const [source, setSource] = useState<AdmissionInquirySource>(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const { data: offerings } = useGetAdmissionOfferingsQuery(
    { admissionCycleId: cycleId, availabilityStatus: 2, maxResultCount: 100, skipCount: 0 },
    { skip: !cycleId }
  );
  const selectedOffering = offerings?.items.find((item) => item.id === offeringId);
  const { data: offeringDetail } = useGetAdmissionOfferingQuery(selectedOffering?.id ?? '', {
    skip: !selectedOffering?.id,
  });
  const { data: form } = useGetAdmissionFormQuery(offeringDetail?.inquiryFormDefinitionId ?? '', {
    skip: !offeringDetail?.inquiryFormDefinitionId,
  });
  const [checkDuplicates, duplicateState] = useCheckAdmissionInquiryDuplicatesMutation();
  const [create, createState] = useCreateAdmissionInquiryMutation();
  const fields = useMemo(() => form?.sections.flatMap((section) => section.fields) ?? [], [form]);
  const getBinding = (key: string) => {
    const field = fields.find((item) => item.bindingKey === key);
    return field ? (values[field.code] ?? '') : '';
  };
  const submit = async (overrideFamilyId?: string | null, createSeparateFamily = false) => {
    const applicantFirstName = getBinding('Applicant.FirstName') || values.applicantFirstName || '';
    const guardianFirstName = getBinding('Guardian.FirstName') || values.guardianFirstName || '';
    const guardianPhone =
      getBinding('Guardian.Mobile') || values.guardianPhone || values.phone || '';
    const payload: CreateAdmissionInquiry = {
      admissionCycleId: cycleId,
      admissionOfferingId: offeringId || null,
      existingFamilyId: overrideFamilyId,
      createSeparateFamily,
      applicantName: [
        applicantFirstName,
        getBinding('Applicant.LastName') || values.applicantLastName,
      ]
        .filter(Boolean)
        .join(' '),
      phone: values.phone || guardianPhone,
      email: values.email || null,
      source,
      sourceDetail: values.sourceDetail || null,
      guardianFirstName,
      guardianLastName: getBinding('Guardian.LastName') || values.guardianLastName || null,
      guardianPhone,
      guardianEmail: getBinding('Guardian.Email') || values.guardianEmail || null,
      applicantFirstName,
      applicantLastName: getBinding('Applicant.LastName') || values.applicantLastName || null,
      applicantDateOfBirth:
        getBinding('Applicant.DateOfBirth') || values.applicantDateOfBirth || null,
      formValues: Object.entries(values).map(([fieldCode, valueJson]) => ({
        fieldCode,
        valueJson: jsonValue(valueJson),
      })),
    };
    try {
      await create(payload).unwrap();
      shikshaMitraToast.success({ message: 'Inquiry created' });
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Unable to create inquiry' });
    }
  };
  const check = async () => {
    try {
      const result = await checkDuplicates({
        admissionCycleId: cycleId,
        guardianPhone: getBinding('Guardian.Mobile') || values.guardianPhone || values.phone || '',
        guardianEmail: getBinding('Guardian.Email') || values.guardianEmail,
        applicantName: [
          getBinding('Applicant.FirstName') || values.applicantFirstName,
          getBinding('Applicant.LastName') || values.applicantLastName,
        ]
          .filter(Boolean)
          .join(' '),
        applicantDateOfBirth: getBinding('Applicant.DateOfBirth') || values.applicantDateOfBirth,
      }).unwrap();
      setMatches(result);
      if (!result.length) await submit();
    } catch {
      shikshaMitraToast.error({ message: 'Duplicate check failed' });
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>New inquiry</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Admission cycle"
            value={cycleId}
            onChange={(event) => {
              setCycleId(event.target.value);
              setOfferingId('');
            }}
            required
            disabled={cyclesLoading || cyclesError}
            error={cyclesError}
            helperText={
              cyclesError
                ? 'Unable to load admission cycles. Close and reopen this dialog to retry.'
                : cyclesLoading
                  ? 'Loading admission cycles…'
                  : undefined
            }
          >
            {cycles.filter((cycle) => cycle.status !== 3).length ? (
              cycles
                .filter((cycle) => cycle.status !== 3)
                .map((cycle) => (
                  <MenuItem key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </MenuItem>
                ))
            ) : (
              <MenuItem value="" disabled>
                No admission cycles available
              </MenuItem>
            )}
          </TextField>
          <TextField
            select
            label="Offering"
            value={offeringId}
            onChange={(event) => setOfferingId(event.target.value)}
            disabled={!cycleId}
          >
            {offerings?.items?.length ? (
              offerings.items.map((offering) => (
                <MenuItem key={offering.id} value={offering.id}>
                  {offering.code}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No offerings available for this cycle
              </MenuItem>
            )}
          </TextField>
          <TextField
            select
            label="Source"
            value={source}
            onChange={(event) => setSource(Number(event.target.value) as AdmissionInquirySource)}
          >
            {sourceOptions.map((label, index) => (
              <MenuItem key={label} value={index}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {fields.length ? (
            fields.map((field) => (
              <TextField
                key={field.code}
                label={field.label}
                required={field.required}
                value={values[field.code] ?? ''}
                helperText={field.helpText ?? undefined}
                placeholder={field.placeholder ?? undefined}
                type={field.fieldType === 5 ? 'date' : 'text'}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, [field.code]: event.target.value }))
                }
                InputLabelProps={field.fieldType === 5 ? { shrink: true } : undefined}
              />
            ))
          ) : (
            <>
              <TextField
                label="Applicant first name"
                required
                value={values.applicantFirstName ?? ''}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, applicantFirstName: event.target.value }))
                }
              />
              <TextField
                label="Guardian mobile"
                required
                value={values.guardianPhone ?? ''}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    guardianPhone: event.target.value,
                    phone: event.target.value,
                  }))
                }
              />
            </>
          )}
          {matches.map((match) => (
            <Alert
              key={match.familyId}
              severity="warning"
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setMatches([]);
                    submit(match.familyId);
                  }}
                >
                  Use existing family
                </Button>
              }
            >
              Possible existing family: {match.applicantName} · {match.guardianPhone ?? '—'}
            </Alert>
          ))}
          {matches.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => {
                setMatches([]);
                submit(null, true);
              }}
              disabled={createState.isLoading}
            >
              Create separate family
            </Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!cycleId || duplicateState.isLoading || createState.isLoading}
          onClick={() => check()}
        >
          Check duplicates and create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
