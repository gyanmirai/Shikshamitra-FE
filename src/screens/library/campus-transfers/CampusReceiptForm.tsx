import type { TransferDetail } from 'src/redux/library/campus-transfer-api';
import type { CustodyReturnCondition } from 'src/redux/library/custody-api';

import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { useFormik, setNestedObjectValues } from 'formik';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Alert, Stack, Button, Checkbox, TextField, FormControlLabel } from '@mui/material';
import {
  useRecordCampusReceiptMutation,
  usePreviewCampusReceiptMutation,
} from 'src/redux/library/campus-transfer-api';

import { receiptSchema } from './campus-transfer-validation';
import { StockActionReview } from '../circulation/StockActionReview';
import { CirculationDateField } from '../circulation/CirculationDateField';
import { useReviewedStockAction } from '../circulation/useReviewedStockAction';

const conditions = [
  { id: 0, name: 'Available' },
  { id: 4, name: 'Damaged' },
  { id: 5, name: 'Under repair' },
];

export default function CampusReceiptForm({
  detail,
  refresh,
}: {
  detail: TransferDetail;
  refresh: () => void;
}) {
  const { id, dispatchedOn } = detail.transfer;
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      receivedOn: '',
      notes: '',
      selected: {} as Record<string, CustodyReturnCondition>,
    },
    validationSchema: receiptSchema(dispatchedOn),
    onSubmit: (): Promise<void> => action.commit(),
  });
  useFormikErrorFocus(formik);
  const { receivedOn, notes, selected } = formik.values;
  const setSelected = (selection: Record<string, CustodyReturnCondition>) =>
    formik.setFieldValue('selected', selection);
  const [previewRequest] = usePreviewCampusReceiptMutation();
  const [recordRequest] = useRecordCampusReceiptMutation();
  const outstanding = detail.copies.filter((copy) => copy.receiptId === null);
  const copies = Object.entries(selected).map(([copyId, condition]) => ({ copyId, condition }));
  const current = copies.every(({ copyId }) => outstanding.some((copy) => copy.copyId === copyId));
  const action = useReviewedStockAction({
    input: { receivedOn, notes: notes.trim() || null, copies },
    allowed: true,
    previewRequest: (body) => previewRequest({ id, body }).unwrap(),
    commitRequest: (body) => recordRequest({ id, body }).unwrap(),
    workflow: 'campus receipt',
    staleCode: 'Library:CampusTransfers:010106',
    onConflict: refresh,
  });
  const guard = useUnsavedNavigation(formik.dirty && !action.saved, {
    blockNavigation: action.busy,
    guardContextChanges: true,
    push: router.push,
    description: action.uncertain
      ? 'The outcome is unconfirmed. Retry the unchanged receipt or review the saved record.'
      : undefined,
  });
  const disabled = action.busy || action.uncertain;
  const review = async () => {
    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), false);
    if (!Object.keys(errors).length && current) await action.preview();
  };
  if (action.saved) {
    return (
      <Alert
        severity="success"
        action={
          outstanding.length > 0 && (
            <Button
              color="inherit"
              onClick={() => {
                formik.resetForm();
                action.reset();
              }}
            >
              Receive more copies
            </Button>
          )
        }
      >
        {action.saved.copies.length} received copies recorded.
      </Alert>
    );
  }
  if (!outstanding.length && !action.uncertain) return null;
  return (
    <FormSectionCard title="Receive dispatched copies" icon={GlobalIcons.issueBook}>
      <Stack spacing={2}>
        {action.error && <Alert severity="error">{action.error}</Alert>}
        {formik.touched.selected && typeof formik.errors.selected === 'string' && (
          <Alert severity="error">{formik.errors.selected}</Alert>
        )}
        {!current && !action.uncertain && (
          <Alert
            severity="warning"
            action={<Button onClick={() => setSelected({})}>Clear selection</Button>}
          >
            A selected copy is no longer outstanding. Review the current list.
          </Alert>
        )}
        <Stack spacing={1} sx={{ maxHeight: 320, overflow: 'auto' }}>
          {outstanding.map((copy) => (
            <Stack
              key={copy.copyId}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
            >
              <FormControlLabel
                sx={{ flex: 1 }}
                label={`${copy.accessionNumber} · ${copy.title}`}
                control={
                  <Checkbox
                    checked={selected[copy.copyId] !== undefined}
                    disabled={disabled}
                    onChange={(event) => {
                      const next = { ...selected };
                      if (event.target.checked) next[copy.copyId] = 0;
                      else delete next[copy.copyId];
                      setSelected(next);
                    }}
                  />
                }
              />
              {selected[copy.copyId] !== undefined && (
                <CustomSelect
                  name={`condition-${copy.copyId}`}
                  label={`Condition for ${copy.accessionNumber}`}
                  value={selected[copy.copyId]}
                  options={conditions}
                  size="small"
                  disabled={disabled}
                  onChange={(event) =>
                    setSelected({
                      ...selected,
                      [copy.copyId]: Number(event) as CustodyReturnCondition,
                    })
                  }
                />
              )}
            </Stack>
          ))}
        </Stack>
        <CirculationDateField
          name="receivedOn"
          label="Received date"
          value={parseDateOnly(receivedOn)}
          error={formik.touched.receivedOn && formik.errors.receivedOn}
          disabled={disabled}
          onBlur={() => formik.setFieldTouched('receivedOn', true)}
          onChange={(value) => formik.setFieldValue('receivedOn', toDateOnly(value) || '')}
        />
        <ShakingTextField error={Boolean(formik.touched.notes && formik.errors.notes)}>
          <TextField
            name="notes"
            value={notes}
            label="Notes"
            size="small"
            multiline
            minRows={2}
            disabled={disabled}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.notes && formik.errors.notes)}
            helperText={formik.touched.notes ? formik.errors.notes : undefined}
          />
        </ShakingTextField>
        <StockActionReview review={action.review} />
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
          <Button size="small" variant="outlined" disabled={disabled} onClick={review}>
            Preview receipt
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={!action.canCommit || (!current && !action.uncertain)}
            onClick={() => formik.submitForm()}
          >
            {action.uncertain ? 'Retry unchanged receipt' : 'Record reviewed receipt'}
          </Button>
        </Stack>
      </Stack>
      {guard.confirmation}
    </FormSectionCard>
  );
}
