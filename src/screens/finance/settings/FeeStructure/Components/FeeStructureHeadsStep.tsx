import type { FormikProps } from 'formik';
import type {
  StructureLine,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  Checkbox,
  TextField,
  Typography,
  IconButton,
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
  const [adding, setAdding] = useState(false);
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
  useEffect(() => {
    if (submitted && !formik.isValidating)
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitted, formik.isValidating]);
  const optionsFor = (line: StructureLine) => {
    const options = settings.terms.map((term) => ({
      value: term.versionId,
      label: `${term.name} · v${term.versionNumber}${term.isDefault ? ' · Default' : ''}`,
    }));
    if (
      line.paymentTermVersionId &&
      !options.some((term) => term.value === line.paymentTermVersionId)
    )
      options.push({
        value: line.paymentTermVersionId,
        label: `${line.paymentTermName || 'Attached term'} · v${line.paymentTermVersionNumber ?? '?'} · retained`,
      });
    return options;
  };
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
        descriptionTooltip="Fixed fee totals cover the selected payment term and include optional heads. Variable amounts are set during student assignment. Optional heads are charged only when selected; this subtotal is not a student's amount due."
        action={
          writable && (
            <CustomTooltip title="Add fee head">
              <span>
                <IconButton
                  size="small"
                  aria-label="Add fee head"
                  aria-expanded={adding}
                  onClick={() => setAdding(!adding)}
                  disabled={busy || !settings.permissions.headsRead || headsError}
                >
                  <Iconify icon={GlobalIcons.addIcon} />
                </IconButton>
              </span>
            </CustomTooltip>
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
            label="Select fee head"
            size="small"
            isSearch
            isLoading={headsLoading}
            value=""
            options={settings.heads.filter(
              (head) => !candidate.feeHeads.some((line) => line.feeHeadId === head.id)
            )}
            labelKey="name"
            valueKey="id"
            disabled={busy || headsError}
            onChange={(value) => {
              if (value) {
                onAdd(String(value));
                setAdding(false);
              }
            }}
            formControlProps={{ fullWidth: true }}
            noOptionsMessage={
              settings.heads.length
                ? 'All available fee heads have been added.'
                : 'No active fee heads are available for this academic year.'
            }
          />
        </Stack>
      )}
      <CustomizableTable
        tableTitle="Fee heads"
        tableId={`${tableId}-inline`}
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
            width: 160,
            minWidth: 140,
            maxWidth: 200,
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
            render: (_value, row) =>
              writable ? (
                <FormControlLabel
                  sx={{ m: 0, display: 'flex' }}
                  label={row.isVariable ? 'Set during assignment' : 'Fixed amount'}
                  control={
                    <Switch
                      size="small"
                      checked={!!row.isVariable}
                      disabled={!writable || busy}
                      slotProps={{ input: { 'aria-label': `${row.feeHeadName} variable fee` } }}
                      onChange={(_event, checked) => onVariable(row.feeHeadId, checked)}
                    />
                  }
                />
              ) : row.isVariable ? (
                'Variable'
              ) : (
                'Fixed'
              ),
          },
          {
            id: 'amount',
            label: 'Amount',
            width: 170,
            minWidth: 170,
            align: 'right',
            isFilter: false,
            isSort: false,
            render: (_value, row) =>
              row.isVariable ? (
                <Typography variant="caption">Set during assignment</Typography>
              ) : writable ? (
                <ShakingTextField
                  error={Boolean(
                    (touched[row.feeHeadId] || submitted) &&
                    amountError(amountInputs[row.feeHeadId] ?? row.amount)
                  )}
                >
                  <NumericFormatCustom
                    size="small"
                    fullWidth
                    required
                    name={`feeHeads[${candidate.feeHeads.findIndex((line) => line.feeHeadId === row.feeHeadId)}].amount`}
                    label="Amount"
                    value={amountInputs[row.feeHeadId] ?? row.amount ?? ''}
                    roundToWholeRupees={false}
                    decimalScale={2}
                    isAllowed={({ floatValue }) =>
                      floatValue === undefined || floatValue <= 9999999999.99
                    }
                    onValueChange={({ value, floatValue }, source) => {
                      if (source.source === 'event')
                        onAmount(row.feeHeadId, value, floatValue ?? null);
                    }}
                    onBlur={() => onTouch(row.feeHeadId)}
                    disabled={!writable || busy}
                    error={Boolean(
                      (touched[row.feeHeadId] || submitted) &&
                      amountError(amountInputs[row.feeHeadId] ?? row.amount)
                    )}
                    helperText={
                      (touched[row.feeHeadId] || submitted) &&
                      amountError(amountInputs[row.feeHeadId] ?? row.amount)
                        ? amountError(amountInputs[row.feeHeadId] ?? row.amount)
                        : undefined
                    }
                    inputProps={{
                      style: { textAlign: 'right' },
                      'aria-label': `${row.feeHeadName} configured amount`,
                    }}
                  />
                </ShakingTextField>
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
            render: (_value, row) =>
              writable ? (
                <ShakingTextField
                  error={Boolean(
                    (touched[`term:${row.feeHeadId}`] || submitted) &&
                    paymentTermError(row as StructureLine)
                  )}
                >
                  <CustomSelect
                    label="Payment term"
                    size="small"
                    required
                    isSearch
                    value={row.paymentTermVersionId ?? ''}
                    options={optionsFor(row as StructureLine)}
                    labelKey="label"
                    valueKey="value"
                    isLoading={termsLoading && !settings.terms.length && !row.paymentTermVersionId}
                    disabled={busy || !writable || !settings.permissions.termsRead}
                    disabledValues={
                      row.paymentTermVersionId &&
                      !settings.terms.some((term) => term.versionId === row.paymentTermVersionId)
                        ? [row.paymentTermVersionId]
                        : []
                    }
                    onBlur={() => onTouch(`term:${row.feeHeadId}`)}
                    error={Boolean(
                      (touched[`term:${row.feeHeadId}`] || submitted) &&
                      paymentTermError(row as StructureLine)
                    )}
                    helperText={
                      !settings.permissions.termsRead
                        ? 'You do not have permission to browse payment terms.'
                        : (touched[`term:${row.feeHeadId}`] || submitted) &&
                            paymentTermError(row as StructureLine)
                          ? paymentTermError(row as StructureLine)
                          : !settings.terms.length && !termsLoading && !row.paymentTermVersionId
                            ? 'Publish a payment term for this academic year and board, then retry terms.'
                            : undefined
                    }
                    onChange={(value) =>
                      onTerm(
                        row as StructureLine,
                        settings.terms.find((term) => term.versionId === value) ?? null
                      )
                    }
                    formControlProps={{ fullWidth: true, required: true }}
                  />
                </ShakingTextField>
              ) : (
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {row.paymentTermName || 'Not selected'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Version {row.paymentTermVersionNumber ?? '?'}
                  </Typography>
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
            render: (_value, row) =>
              writable ? (
                <FormControlLabel
                  label=""
                  control={
                    <Checkbox
                      size="small"
                      inputProps={{ 'aria-label': `${row.feeHeadName} optional for students` }}
                      disabled={!writable || busy}
                      checked={row.isOptional}
                      onChange={(_event, checked) =>
                        onLineChange(row.feeHeadId, { isOptional: checked })
                      }
                    />
                  }
                />
              ) : row.isOptional ? (
                'Yes'
              ) : (
                'No'
              ),
          },
          {
            id: 'schedule',
            label: writable ? 'Actions' : 'Schedule',
            width: writable ? 112 : 80,
            minWidth: writable ? 112 : 80,
            align: 'center',
            sticky: true,
            stickyPosition: 'right',
            isFilter: false,
            isSort: false,
            excludeFromExport: true,
            render: (_value, row) => (
              <AdaptiveThreeDotsActions
                actions={[
                  {
                    id: 'schedule',
                    label: `View ${row.feeHeadName} schedule`,
                    icon: GlobalIcons.eye,
                    tooltip:
                      row.scheduleMode === 'Customized' ? 'View custom schedule' : 'View schedule',
                    disabled: busy || !row.paymentTermVersionId || !settings.permissions.termsRead,
                    onClick: () => onSchedule(row.feeHeadId),
                  },
                  ...(writable
                    ? [
                        {
                          id: 'remove',
                          label: `Remove ${row.feeHeadName}`,
                          icon: GlobalIcons.delete,
                          color: 'error.main',
                          disabled: busy,
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

      <Stack direction="row" justifyContent="flex-end" spacing={1} useFlexGap flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          Fixed fee total
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
