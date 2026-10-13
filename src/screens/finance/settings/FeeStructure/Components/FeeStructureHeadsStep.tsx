import type { FormikProps } from 'formik';
import type {
  StructureLine,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { structureMoney } from '../feeStructurePresentation';
import { amountError, paymentTermError } from '../feeStructureModel';

interface Props {
  formik: FormikProps<StructureCandidate>;
  settings: StructureSettings;
  tableId: string;
  writable: boolean;
  busy: boolean;
  locked: boolean;
  revision: boolean;
  submitted: boolean;
  nameError: string;
  amountInputs: Record<string, string>;
  touched: Record<string, boolean>;
  headsLoading: boolean;
  headsError: boolean;
  termsLoading: boolean;
  termsError: boolean;
  onRetryHeads: () => void;
  onRetryTerms: () => void;
  onTouch: (field: string) => void;
  onChange: (value: StructureCandidate) => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onVariable: (id: string, variable: boolean) => void;
  onAmount: (id: string, raw: string, amount: number | null) => void;
  onLineChange: (id: string, values: Partial<StructureLine>) => void;
  onTerm: (line: StructureLine, term: StructureSettings['terms'][number] | null) => void;
  onSchedule: (id: string) => void;
}

export default function FeeStructureHeadsStep({
  formik,
  settings,
  tableId,
  writable,
  busy,
  locked,
  revision,
  submitted,
  nameError,
  amountInputs,
  touched,
  headsLoading,
  headsError,
  termsLoading,
  termsError,
  onRetryHeads,
  onRetryTerms,
  onTouch,
  onChange,
  onAdd,
  onRemove,
  onVariable,
  onAmount,
  onLineChange,
  onTerm,
  onSchedule,
}: Props) {
  const candidate = formik.values;
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [adding, setAdding] = useState(false);
  const [addHeadId, setAddHeadId] = useState('');
  const lines = candidate.feeHeads.map((line) => ({
    ...line,
    _id: line.feeHeadId,
    feeHeadName:
      (locked
        ? line.feeHeadName
        : settings.heads.find((head) => head.id === line.feeHeadId)?.name) ||
      line.feeHeadName ||
      'Unavailable fee head',
  }));
  const selected = lines.find((line) => line.feeHeadId === selectedId);
  useEffect(() => {
    if (!submitted) return;
    const invalid = candidate.feeHeads.find(
      (line) =>
        (!line.isVariable && amountError(amountInputs[line.feeHeadId] ?? line.amount)) ||
        paymentTermError(line)
    );
    if (invalid) setSelectedId(invalid.feeHeadId);
  }, [submitted, candidate.feeHeads, amountInputs]);
  useEffect(() => {
    if (submitted && !formik.isValidating)
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitted, selectedId, formik.isValidating]);
  const termOptions =
    locked && selected?.paymentTermVersionId
      ? [
          {
            value: selected.paymentTermVersionId,
            label: `${selected.paymentTermName || 'Attached term'} · v${selected.paymentTermVersionNumber ?? '?'}`,
          },
        ]
      : settings.terms.map((term) => ({
          value: term.versionId,
          label: `${term.name} · v${term.versionNumber}${term.isDefault ? ' · Default' : ''}`,
        }));
  if (
    selected?.paymentTermVersionId &&
    !termOptions.some((term) => term.value === selected.paymentTermVersionId)
  )
    termOptions.push({
      value: selected.paymentTermVersionId,
      label: `${selected.paymentTermName || 'Attached term'} · v${selected.paymentTermVersionNumber ?? '?'} · retained`,
    });
  const selectedAmountError =
    selected && !selected.isVariable
      ? amountError(amountInputs[selected.feeHeadId] ?? selected.amount)
      : '';
  const selectedTermError = selected ? paymentTermError(selected) : '';
  return (
    <Stack ref={formRef} spacing={2}>
      <Box sx={{ maxWidth: 560 }}>
        <ShakingTextField error={Boolean((touched.name || submitted) && nameError)}>
          <TextField
            name="name"
            label="Structure name"
            required
            size="small"
            fullWidth
            disabled={!writable || revision}
            value={candidate.name}
            onChange={(event) => onChange({ ...candidate, name: event.target.value })}
            onBlur={() => onTouch('name')}
            inputProps={{ maxLength: 256 }}
            error={Boolean((touched.name || submitted) && nameError)}
            helperText={(touched.name || submitted) && nameError ? nameError : undefined}
          />
        </ShakingTextField>
      </Box>
      <FormSectionHeader
        icon="mdi:cash-multiple"
        title="Fee heads"
        descriptionTooltip="Configured fixed amounts cover the selected payment term and include optional heads. Variable amounts are set during student assignment. Optional heads are charged only when selected; this subtotal is not a student's amount due."
        action={
          writable && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => setAdding(!adding)}
              disabled={!settings.permissions.headsRead || headsError}
            >
              Add Fee Head
            </Button>
          )
        }
      />
      {(!settings.permissions.headsRead || headsError) && (
        <Alert
          severity="warning"
          action={
            settings.permissions.headsRead ? (
              <Button size="small" onClick={onRetryHeads}>
                Retry Fee Heads
              </Button>
            ) : undefined
          }
        >
          {settings.permissions.headsRead
            ? 'Fee heads could not be loaded. Existing lines are preserved.'
            : 'You do not have permission to browse fee heads.'}
        </Alert>
      )}
      {termsError && (
        <Alert
          severity="warning"
          action={
            <Button size="small" onClick={onRetryTerms}>
              Retry Terms
            </Button>
          }
        >
          Payment terms could not be loaded. Saved version pins are preserved.
        </Alert>
      )}
      {adding && writable && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
          sx={{ maxWidth: 640 }}
        >
          <CustomSelect
            label="Add Fee Head"
            size="small"
            isSearch
            isLoading={headsLoading}
            value={addHeadId}
            options={settings.heads.filter(
              (head) => !candidate.feeHeads.some((line) => line.feeHeadId === head.id)
            )}
            labelKey="name"
            valueKey="id"
            onChange={(value) => setAddHeadId(String(value))}
            formControlProps={{ fullWidth: true }}
            noOptionsMessage={
              settings.heads.length
                ? 'All available fee heads have been added.'
                : 'No active fee heads are available for this academic year.'
            }
          />
          <Button
            size="small"
            variant="outlined"
            disabled={!addHeadId || headsError || !settings.permissions.headsRead}
            onClick={() => {
              onAdd(addHeadId);
              setSelectedId(addHeadId);
              setAddHeadId('');
              setAdding(false);
            }}
            sx={{ flexShrink: 0 }}
          >
            Add Head
          </Button>
        </Stack>
      )}
      {selected ? (
        <FormSectionCard
          icon="mdi:file-document-edit-outline"
          title={selected.feeHeadName}
          action={
            <Button
              size="small"
              startIcon={<Iconify icon="mdi:arrow-left" />}
              onClick={() => setSelectedId(undefined)}
              disabled={busy}
            >
              All Fee Heads
            </Button>
          }
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Pricing method
              </Typography>
              <FormControlLabel
                sx={{ m: 0, display: 'flex' }}
                label={selected.isVariable ? 'Set during assignment' : 'Fixed amount'}
                control={
                  <Switch
                    size="small"
                    checked={!!selected.isVariable}
                    disabled={!writable}
                    slotProps={{ input: { 'aria-label': `${selected.feeHeadName} variable fee` } }}
                    onChange={(_event, checked) => onVariable(selected.feeHeadId, checked)}
                  />
                }
              />
            </Box>
            {selected.isVariable ? (
              <Box sx={{ alignSelf: 'center' }}>
                <Typography variant="body2">Set during student assignment</Typography>
              </Box>
            ) : (
              <ShakingTextField
                error={Boolean((touched[selected.feeHeadId] || submitted) && selectedAmountError)}
              >
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  required
                  name={`feeHeads[${candidate.feeHeads.findIndex((line) => line.feeHeadId === selected.feeHeadId)}].amount`}
                  label="Configured amount (₹)"
                  value={amountInputs[selected.feeHeadId] ?? selected.amount ?? ''}
                  roundToWholeRupees={false}
                  decimalScale={2}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined || floatValue <= 9999999999.99
                  }
                  onValueChange={({ value, floatValue }, source) => {
                    if (source.source === 'event')
                      onAmount(selected.feeHeadId, value, floatValue ?? null);
                  }}
                  onBlur={() => onTouch(selected.feeHeadId)}
                  disabled={!writable}
                  error={Boolean((touched[selected.feeHeadId] || submitted) && selectedAmountError)}
                  helperText={
                    (touched[selected.feeHeadId] || submitted) && selectedAmountError
                      ? selectedAmountError
                      : undefined
                  }
                  inputProps={{
                    style: { textAlign: 'right' },
                    'aria-label': `${selected.feeHeadName} configured amount`,
                  }}
                />
              </ShakingTextField>
            )}
            <ShakingTextField
              error={Boolean(
                (touched[`term:${selected.feeHeadId}`] || submitted) && selectedTermError
              )}
            >
              <CustomSelect
                label="Payment Term"
                size="small"
                required
                isSearch
                value={selected.paymentTermVersionId ?? ''}
                options={termOptions}
                labelKey="label"
                valueKey="value"
                isLoading={termsLoading && !settings.terms.length && !selected.paymentTermVersionId}
                disabled={!writable || !settings.permissions.termsRead}
                disabledValues={
                  selected.paymentTermVersionId &&
                  !settings.terms.some((term) => term.versionId === selected.paymentTermVersionId)
                    ? [selected.paymentTermVersionId]
                    : []
                }
                onBlur={() => onTouch(`term:${selected.feeHeadId}`)}
                error={Boolean(
                  (touched[`term:${selected.feeHeadId}`] || submitted) && selectedTermError
                )}
                helperText={
                  !settings.permissions.termsRead
                    ? 'You do not have permission to browse payment terms.'
                    : (touched[`term:${selected.feeHeadId}`] || submitted) && selectedTermError
                      ? selectedTermError
                      : !settings.terms.length && !termsLoading && !selected.paymentTermVersionId
                        ? 'Publish a payment term for this academic year and board, then retry terms.'
                        : undefined
                }
                onChange={(value) =>
                  onTerm(selected, settings.terms.find((term) => term.versionId === value) ?? null)
                }
                formControlProps={{ fullWidth: true, required: true }}
              />
            </ShakingTextField>
            <Box sx={{ alignSelf: 'center' }}>
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:calendar-outline" />}
                disabled={busy || !selected.paymentTermVersionId || !settings.permissions.termsRead}
                onClick={() => onSchedule(selected.feeHeadId)}
              >
                {selected.scheduleMode === 'Customized' ? 'View Custom Schedule' : 'View Schedule'}
              </Button>
            </Box>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            useFlexGap
            flexWrap="wrap"
            spacing={1}
          >
            <FormControlLabel
              label="Optional for students"
              control={
                <Checkbox
                  size="small"
                  disabled={!writable}
                  checked={selected.isOptional}
                  onChange={(_event, checked) =>
                    onLineChange(selected.feeHeadId, { isOptional: checked })
                  }
                />
              }
            />
            {writable && (
              <Button
                size="small"
                color="error"
                startIcon={<Iconify icon="mdi:delete-outline" />}
                onClick={() => {
                  onRemove(selected.feeHeadId);
                  setSelectedId(undefined);
                }}
              >
                Remove Fee Head
              </Button>
            )}
          </Stack>
        </FormSectionCard>
      ) : (
        <CustomizableTable
          tableTitle="Fee heads"
          tableId={tableId}
          data={lines}
          isPagination={false}
          isSearch={false}
          isFilter={false}
          isShowedDense={false}
          showToolbar={false}
          noDataText={
            writable
              ? 'No fee heads added. Add a fee head to build this structure.'
              : 'No fee heads are configured for this structure.'
          }
          columns={[
            {
              id: 'feeHeadName',
              label: 'Fee head',
              minWidth: 200,
              isFilter: false,
              isSort: false,
              render: (_value, row) => (
                <Box>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {row.feeHeadName}
                  </Typography>
                  {row.categoryName && (
                    <Typography variant="caption" color="text.secondary">
                      {row.categoryName}
                    </Typography>
                  )}
                </Box>
              ),
            },
            {
              id: 'isVariable',
              label: 'Pricing',
              width: 130,
              minWidth: 130,
              isFilter: false,
              isSort: false,
              render: (_value, row) => (row.isVariable ? 'Variable' : 'Fixed'),
            },
            {
              id: 'amount',
              label: 'Configured amount (₹)',
              width: 170,
              minWidth: 170,
              align: 'right',
              isFilter: false,
              isSort: false,
              render: (_value, row) =>
                row.isVariable ? (
                  <Typography variant="caption">Set during assignment</Typography>
                ) : row.amount == null ? (
                  'Not set'
                ) : (
                  structureMoney(row.amount)
                ),
            },
            {
              id: 'paymentTermVersionId',
              label: 'Payment term',
              width: 240,
              minWidth: 220,
              isFilter: false,
              isSort: false,
              render: (_value, row) => (
                <Stack alignItems="flex-start" spacing={0.5}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {row.paymentTermName ||
                      settings.terms.find((term) => term.versionId === row.paymentTermVersionId)
                        ?.name ||
                      'Not selected'}
                  </Typography>
                  {row.paymentTermVersionId && (
                    <Typography variant="caption" color="text.secondary">
                      v
                      {row.paymentTermVersionNumber ??
                        settings.terms.find((term) => term.versionId === row.paymentTermVersionId)
                          ?.versionNumber ??
                        '?'}
                    </Typography>
                  )}
                  <Button
                    size="small"
                    disabled={busy || !row.paymentTermVersionId || !settings.permissions.termsRead}
                    onClick={() => onSchedule(row.feeHeadId)}
                  >
                    View Schedule
                  </Button>
                </Stack>
              ),
            },
            {
              id: 'isOptional',
              label: 'Optional',
              width: 90,
              minWidth: 90,
              align: 'center',
              isFilter: false,
              isSort: false,
              render: (_value, row) => (row.isOptional ? 'Yes' : 'No'),
            },
            {
              id: 'actions',
              label: 'Actions',
              width: 88,
              minWidth: 88,
              align: 'right',
              sticky: true,
              stickyPosition: 'right',
              isFilter: false,
              isSort: false,
              excludeFromExport: true,
              render: (_value, row) => (
                <AdaptiveThreeDotsActions
                  actions={[
                    {
                      id: 'edit',
                      label: writable ? 'Edit Fee Head' : 'View Fee Head',
                      icon: writable ? 'mdi:pencil-outline' : 'mdi:eye-outline',
                      disabled: busy,
                      onClick: () => setSelectedId(row.feeHeadId),
                    },
                    ...(writable
                      ? [
                          {
                            id: 'remove',
                            label: 'Remove Fee Head',
                            icon: 'mdi:delete-outline',
                            color: 'error.main',
                            onClick: () => onRemove(row.feeHeadId),
                          },
                        ]
                      : []),
                  ]}
                />
              ),
            },
          ]}
        />
      )}
      <Stack direction="row" justifyContent="flex-end" spacing={1} useFlexGap flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          Configured fixed amount
        </Typography>
        <Typography variant="subtitle2">
          {structureMoney(
            candidate.feeHeads
              .filter((line) => !line.isVariable)
              .reduce((total, line) => total + (line.amount ?? 0), 0)
          )}
        </Typography>
        {candidate.feeHeads.some((line) => line.isVariable) && (
          <Typography variant="caption" color="text.secondary">
            + variable amounts at assignment
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
