import type {
  CustodyDetail,
  CustodyReturnInput,
  CustodyReturnCondition,
} from 'src/redux/library/custody-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useCommitCustodyReturnMutation,
  usePreviewCustodyReturnMutation,
} from 'src/redux/library/custody-api';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { StockActionReview } from '../circulation/StockActionReview';
import { CirculationDateField } from '../circulation/CirculationDateField';
import { useReviewedStockAction } from '../circulation/useReviewedStockAction';

export const custodyReturnConditions = [
  { id: 0, name: 'Available' },
  { id: 4, name: 'Damaged' },
  { id: 5, name: 'Under repair' },
];
type ReturnValues = {
  receivedOn: string;
  notes: string;
  selected: Record<string, CustodyReturnCondition>;
};
const initialValues: ReturnValues = { receivedOn: '', notes: '', selected: {} };
const schema = Yup.object({
  receivedOn: Yup.string().required('Enter the actual received date.'),
  notes: Yup.string().max(500, 'Use up to 500 characters.'),
});

export function CustodyReturnForm({
  detail,
  refresh,
}: {
  detail: CustodyDetail;
  refresh: () => void;
}) {
  const { id } = detail.handoff;
  const router = useRouter();
  const [requestPreview] = usePreviewCustodyReturnMutation();
  const [requestCommit] = useCommitCustodyReturnMutation();
  const formik = useFormik({ initialValues, validationSchema: schema, onSubmit: () => undefined });
  const outstanding = detail.copies.filter((copy) => copy.returnReceiptId == null);
  const input: CustodyReturnInput = {
    receivedOn: formik.values.receivedOn,
    notes: formik.values.notes.trim() || null,
    copies: Object.entries(formik.values.selected).map(([copyId, condition]) => ({
      copyId,
      condition,
    })),
  };
  const current = input.copies.every(({ copyId }) =>
    outstanding.some((copy) => copy.copyId === copyId)
  );
  const action = useReviewedStockAction({
    input,
    allowed: true,
    previewRequest: (body) => requestPreview({ id, body }).unwrap(),
    commitRequest: (body) => requestCommit({ id, body }).unwrap(),
    onConflict: refresh,
  });
  const guard = useUnsavedNavigation(formik.dirty && !action.saved, {
    blockNavigation: action.busy,
    guardContextChanges: true,
    push: router.push,
    description: action.uncertain
      ? 'The receipt outcome is unconfirmed. Retry the unchanged receipt or check custody history after leaving.'
      : undefined,
  });
  const disabled = action.busy || action.uncertain;
  const preview = async () => {
    await formik.setFieldTouched('receivedOn', true);
    if (!Object.keys(await formik.validateForm()).length && input.copies.length && current)
      await action.preview();
  };
  const updateSelection = (copyId: string, condition?: CustodyReturnCondition) => {
    const selected = { ...formik.values.selected };
    if (condition === undefined) delete selected[copyId];
    else selected[copyId] = condition;
    formik.setFieldValue('selected', selected);
  };
  if (action.saved)
    return (
      <Alert
        severity="success"
        action={
          outstanding.length > 0 && (
            <Button
              color="inherit"
              size="small"
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
        {action.saved.copies.length} copies received and recorded.
      </Alert>
    );
  if (!outstanding.length && !action.uncertain) return null;
  return (
    <>
      <FormSectionCard title="Receive classroom copies" icon={GlobalIcons.issueBook}>
        <FormBusyRegion busy={action.busy} showOverlay={false} label="Reviewing classroom return">
          <Stack spacing={1.5}>
            {action.error && <Alert severity="error">{action.error}</Alert>}
            {!current && !action.uncertain && (
              <Alert
                severity="warning"
                action={
                  <Button
                    onClick={() =>
                      formik.setFieldValue(
                        'selected',
                        Object.fromEntries(
                          Object.entries(formik.values.selected).filter(([copyId]) =>
                            outstanding.some((copy) => copy.copyId === copyId)
                          )
                        )
                      )
                    }
                  >
                    Remove received copies
                  </Button>
                }
              >
                A selected copy has already been received. Review the remaining copies.
              </Alert>
            )}
            <Typography variant="body2">
              Select the copies physically received and record their condition.
            </Typography>
            <Stack spacing={1} sx={{ maxHeight: 320, overflow: 'auto', pr: 0.5 }}>
              {outstanding.map((copy) => {
                const selected = formik.values.selected[copy.copyId];
                return (
                  <Box
                    key={copy.copyId}
                    sx={{
                      display: 'grid',
                      gap: 1,
                      alignItems: 'center',
                      gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(155px, 240px)' },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selected !== undefined}
                          disabled={disabled}
                          onChange={(event) =>
                            updateSelection(copy.copyId, event.target.checked ? 0 : undefined)
                          }
                        />
                      }
                      label={`${copy.accessionNumber} · ${copy.title}`}
                    />
                    {selected !== undefined && (
                      <CustomSelect
                        name={`condition-${copy.copyId}`}
                        label={`Condition · ${copy.accessionNumber}`}
                        size="small"
                        fullWidth
                        options={custodyReturnConditions}
                        value={selected}
                        valueKey="id"
                        labelKey="name"
                        disabled={disabled}
                        onChange={(value) =>
                          updateSelection(copy.copyId, Number(value) as CustodyReturnCondition)
                        }
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CirculationDateField
                  label="Received on"
                  name="receivedOn"
                  value={parseDateOnly(formik.values.receivedOn)}
                  disabled={disabled}
                  onChange={(day) => formik.setFieldValue('receivedOn', toDateOnly(day))}
                  onBlur={() => formik.setFieldTouched('receivedOn', true)}
                  error={formik.touched.receivedOn ? formik.errors.receivedOn : undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...formik.getFieldProps('notes')}
                  label="Receipt notes"
                  size="small"
                  fullWidth
                  disabled={disabled}
                  error={Boolean(formik.touched.notes && formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </Grid>
            </Grid>
            <StockActionReview review={action.review} />
            <Stack direction="row" justifyContent="flex-end" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={preview}
                disabled={disabled || !input.copies.length || !current}
              >
                Preview return
              </Button>
              <Button
                variant="contained"
                size="small"
                color="inherit"
                disabled={!action.canCommit || (!current && !action.uncertain)}
                onClick={action.commit}
              >
                {action.uncertain ? 'Retry unchanged receipt' : 'Receive reviewed copies'}
              </Button>
            </Stack>
          </Stack>
        </FormBusyRegion>
      </FormSectionCard>
      {guard.confirmation}
    </>
  );
}
