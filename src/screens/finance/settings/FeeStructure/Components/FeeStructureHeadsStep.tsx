import type { FormikProps } from 'formik';
import type {
  StructureLine,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useId, useRef, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Box, Stack, Alert, Button, TextField, Typography, FormHelperText } from '@mui/material';

import { structureMoney } from '../feeStructurePresentation';
import FeeStructureHeadDialog from './FeeStructureHeadDialog';
import { amountError, paymentTermError } from '../feeStructureModel';

interface Props {
  adding: boolean;
  onCloseAdd: () => void;
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
  onSaveLine: (line: StructureLine, previousId?: string) => void;
  onRemove: (id: string) => void;
  onSchedule: (id: string) => void;
}

export default function FeeStructureHeadsStep({
  adding,
  onCloseAdd,
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
  onSaveLine,
  onRemove,
  onSchedule,
}: Props) {
  const candidate = formik.values;
  const mobile = useResponsive('down', 'sm');
  const formRef = useRef<HTMLDivElement>(null);
  const validationId = useId();
  const dialog = useBoolean();
  const [editingLine, setEditingLine] = useState<StructureLine>();
  const [removingLine, setRemovingLine] = useState<StructureLine>();
  const lines = candidate.feeHeads.map((line) => ({
    ...line,
    _id: line.feeHeadId,
    feeHeadName:
      (locked
        ? line.feeHeadName
        : settings.heads.find((head) => head.id === line.feeHeadId)?.name) ||
      line.feeHeadName ||
      'Unavailable fee head',
    amountError:
      !line.isVariable && (submitted || touched[line.feeHeadId])
        ? amountError(amountInputs[line.feeHeadId] ?? line.amount)
        : '',
    termError: submitted || touched[`term:${line.feeHeadId}`] ? paymentTermError(line) : '',
  }));
  useEffect(() => {
    if (submitted && !formik.isValidating)
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
        ?.focus();
  }, [submitted, formik.isValidating]);
  const total =
    candidate.feeHeads
      .filter((line) => !line.isVariable)
      .reduce((sum, line) => sum + Math.round((line.amount ?? 0) * 100), 0) / 100;
  const nameInvalid = Boolean((touched.name || submitted) && nameError);
  return (
    <Stack ref={formRef} spacing={2}>
      <FormSectionCard
        title="General Information"
        icon={GlobalIcons.notebook}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        descriptionTooltip="Name this class's fee structure. The name identifies it when assigning fees to students."
      >
        <Box sx={{ width: 1, maxWidth: 560 }}>
          <ShakingTextField error={nameInvalid}>
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
              error={nameInvalid}
              helperText={nameInvalid ? nameError : undefined}
            />
          </ShakingTextField>
        </Box>
      </FormSectionCard>
      <FormSectionCard
        descriptionTooltip="Annual amounts cover the attached payment term. The total includes optional heads; variable amounts are set during student assignment. This configuration total is not a student's amount due."
        icon={GlobalIcons.receiptIcon}
        title="Fee Heads"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        contentSx={{ minWidth: 0 }}
      >
        {(!settings.permissions.headsRead || headsError) && (
          <Alert
            severity="error"
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
            severity="error"
            action={
              <Button size="small" onClick={onRetryTerms}>
                Retry Terms
              </Button>
            }
          >
            Payment terms could not be loaded. Saved version pins are preserved.
          </Alert>
        )}
        <CustomizableTable
          getRowAction={(row) =>
            !busy &&
            !row.collectAtAdmission &&
            row.paymentTermVersionId &&
            settings.permissions.termsRead
              ? {
                  label: `Open ${row.feeHeadName} schedule`,
                  onClick: () => {
                    onSchedule(row.feeHeadId);
                  },
                }
              : undefined
          }
          tableTitle="Fee heads"
          tableId={`${tableId}-summary`}
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
              label: 'Fee head name',
              minWidth: 220,
              isFilter: false,
              isSort: false,
              render: (_value, row) => (
                <Box>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {row.feeHeadName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[
                      row.categoryName,
                      row.isOptional ? 'Optional' : 'Required',
                      row.collectAtAdmission
                        ? 'Admission only · Excluded from collection and income'
                        : 'Regular collection',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                  {mobile && (row.amountError || row.termError) && (
                    <Stack
                      role="group"
                      aria-label={`Errors for ${row.feeHeadName}`}
                      data-invalid="true"
                      tabIndex={-1}
                      spacing={0.5}
                      sx={{ mt: 0.5 }}
                    >
                      {row.amountError && (
                        <FormHelperText error sx={{ m: 0 }}>
                          Annual amount: {row.amountError}
                        </FormHelperText>
                      )}
                      {row.termError && (
                        <FormHelperText error sx={{ m: 0 }}>
                          Payment frequency: {row.termError}
                        </FormHelperText>
                      )}
                    </Stack>
                  )}
                </Box>
              ),
            },
            {
              cellSx: { textAlign: 'right' as const },
              id: 'amount',
              label: 'Annual amount',
              minWidth: 160,
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (_value, row) => (
                <Stack
                  spacing={0.5}
                  role="group"
                  aria-label={`Annual amount for ${row.feeHeadName}`}
                  data-invalid={!!row.amountError}
                  aria-describedby={
                    row.amountError ? `${validationId}-${row.feeHeadId}-amount-error` : undefined
                  }
                  tabIndex={row.amountError ? -1 : undefined}
                >
                  <Typography
                    variant="body2"
                    color={row.amountError ? 'error.main' : 'text.primary'}
                  >
                    {row.isVariable
                      ? 'Set during assignment'
                      : row.amount == null
                        ? 'Not set'
                        : structureMoney(row.amount)}
                  </Typography>
                  {row.amountError && (
                    <FormHelperText
                      error
                      id={`${validationId}-${row.feeHeadId}-amount-error`}
                      sx={{ m: 0, textAlign: 'right' }}
                    >
                      {row.amountError}
                    </FormHelperText>
                  )}
                </Stack>
              ),
            },
            {
              id: 'paymentTermName',
              label: 'Payment frequency',
              minWidth: 220,
              isFilter: false,
              isSort: false,
              render: (_value, row) => (
                <Stack
                  spacing={0.5}
                  role="group"
                  aria-label={`Payment frequency for ${row.feeHeadName}`}
                  data-invalid={!!row.termError}
                  aria-describedby={
                    row.termError ? `${validationId}-${row.feeHeadId}-term-error` : undefined
                  }
                  tabIndex={row.termError ? -1 : undefined}
                >
                  <Typography
                    variant="body2"
                    color={row.termError ? 'error.main' : 'text.primary'}
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {row.collectAtAdmission
                      ? 'Not applicable · Admission only'
                      : row.paymentTermId && row.paymentTermVersionId
                        ? row.paymentTermName || 'Attached payment frequency'
                        : 'Not selected'}
                  </Typography>
                  {!row.collectAtAdmission && row.paymentTermVersionId && (
                    <Typography variant="caption" color="text.secondary">
                      Version {row.paymentTermVersionNumber ?? '?'}
                      {row.scheduleMode === 'Customized' ? ' · Customized installments' : ''}
                    </Typography>
                  )}
                  {row.termError && (
                    <FormHelperText
                      error
                      id={`${validationId}-${row.feeHeadId}-term-error`}
                      sx={{ m: 0 }}
                    >
                      {row.termError}
                    </FormHelperText>
                  )}
                </Stack>
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              width: 128,
              minWidth: 128,
              align: 'left',
              sticky: true,
              stickyPosition: 'right',
              isFilter: false,
              isSort: false,
              excludeFromExport: true,
              render: (_value, row) => (
                <AdaptiveThreeDotsActions
                  directActionLimit={3}
                  collapseOnOverflow={false}
                  moreLabel={`More actions for ${row.feeHeadName}`}
                  actions={[
                    ...(writable
                      ? [
                          {
                            id: 'edit',
                            label: `Edit ${row.feeHeadName}`,
                            icon: GlobalIcons.edit,
                            tooltip: 'Edit fee head',
                            disabled: busy,
                            onClick: () => {
                              setEditingLine(
                                candidate.feeHeads.find((line) => line.feeHeadId === row.feeHeadId)
                              );
                              dialog.onTrue();
                            },
                          },
                          {
                            id: 'remove',
                            label: `Delete ${row.feeHeadName}`,
                            icon: GlobalIcons.delete,
                            tooltip: 'Delete fee head',
                            color: 'error.main',
                            disabled: busy,
                            onClick: () => setRemovingLine(row as StructureLine),
                          },
                        ]
                      : []),
                  ]}
                />
              ),
            },
          ]}
        />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}
        >
          <Typography variant="subtitle2">Total annual amount</Typography>
          <Typography variant="h6">{structureMoney(total)}</Typography>
        </Stack>
      </FormSectionCard>
      {(dialog.value || adding) && (
        <FeeStructureHeadDialog
          line={editingLine}
          revealErrors={submitted && !!editingLine}
          amountInput={editingLine ? amountInputs[editingLine.feeHeadId] : undefined}
          lines={candidate.feeHeads}
          settings={settings}
          busy={busy || !writable}
          headsLoading={headsLoading}
          headsError={headsError}
          termsLoading={termsLoading}
          termsError={termsError}
          onClose={() => {
            onCloseAdd();
            dialog.onFalse();
            setEditingLine(undefined);
          }}
          onSave={(line) => {
            if (!writable || busy) return;
            onSaveLine(line, editingLine?.feeHeadId);
            onCloseAdd();
            dialog.onFalse();
            setEditingLine(undefined);
          }}
        />
      )}
      <ConfirmDialog
        disableCancel={busy}
        open={!!removingLine}
        onClose={() => setRemovingLine(undefined)}
        title="Delete Fee Head?"
        content={`Delete ${removingLine?.feeHeadName || 'this fee head'} from this draft? Save the structure draft to persist this change.`}
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={busy || !writable}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              if (removingLine && writable && !busy) {
                onRemove(removingLine.feeHeadId);
                setRemovingLine(undefined);
              }
            }}
          >
            Delete fee head
          </Button>
        }
      />
    </Stack>
  );
}
