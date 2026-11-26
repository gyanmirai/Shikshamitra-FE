import { sanitizeFinanceName } from 'src/utils/finance-name';
import type { FormikProps } from 'formik';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { FinancePrerequisite } from 'src/screens/finance/components/FinancePrerequisiteState';
import type {
  StructureLine,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { GlobalIcons } from 'src/utils/icons';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useId, useRef, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import FinancePrerequisiteState from 'src/screens/finance/components/FinancePrerequisiteState';
import { Box, Stack, Alert, Button, TextField, Typography, FormHelperText } from '@mui/material';

import { structureMoney } from '../feeStructurePresentation';
import FeeStructureHeadDialog from './FeeStructureHeadDialog';
import { amountError, paymentTermError } from '../feeStructureModel';

interface Props {
  scope: { feeStructureMetadataId: string; standardId: string };
  prerequisites?: FinancePrerequisite[];
  onRefreshPrerequisites?: () => void;
  adding: boolean;
  onAdd: () => void;
  onCloseAdd: () => void;
  formik: FormikProps<StructureCandidate>;
  settings: StructureSettings;
  tableId: string;
  writable: boolean;
  busy: boolean;
  locked: boolean;
  fillHeight: boolean;
  submitted: boolean;
  nameError: string;
  showNameError: boolean;
  feeHeadsError: string;
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
  scope,
  prerequisites = [],
  onRefreshPrerequisites,
  adding,
  onAdd,
  onCloseAdd,
  formik,
  settings,
  tableId,
  writable,
  busy,
  locked,
  fillHeight,
  submitted,
  nameError,
  showNameError,
  feeHeadsError,
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
  const nameInvalid = Boolean((touched.name || submitted || showNameError) && nameError);
  const addHeadDisabled =
    busy ||
    headsLoading ||
    headsError ||
    !settings.permissions.headsRead ||
    prerequisites.length > 0;
  const feeHeadsErrorId = `${validationId}-fee-heads-error`;
  return (
    <Stack ref={formRef} spacing={2} sx={fillHeight ? { flex: 1, minHeight: 0 } : undefined}>
      <FormSectionCard
        title="General Information"
        icon={GlobalIcons.notebook}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        sx={{ flexShrink: 0 }}
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
              disabled={!writable}
              value={candidate.name}
              onChange={(event) =>
                onChange({
                  ...candidate,
                  name: capitalizeFirstLetter(sanitizeFinanceName(event.target.value)),
                })
              }
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
        sx={
          fillHeight
            ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
            : undefined
        }
        contentSx={{
          minWidth: 0,
          ...(fillHeight && { flex: 1, minHeight: 0, '& > :not(:last-child)': { flexShrink: 0 } }),
        }}
        action={
          writable && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              disabled={addHeadDisabled}
              data-invalid={!!feeHeadsError && !addHeadDisabled}
              aria-describedby={feeHeadsError ? feeHeadsErrorId : undefined}
              onClick={onAdd}
            >
              Fee Head
            </Button>
          )
        }
      >
        {feeHeadsError && (
          <FormHelperText
            id={feeHeadsErrorId}
            error
            tabIndex={addHeadDisabled ? -1 : undefined}
            data-invalid={addHeadDisabled}
            sx={{ m: 0 }}
          >
            {feeHeadsError}
          </FormHelperText>
        )}
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
        {prerequisites.length && !candidate.feeHeads.length ? (
          <FinancePrerequisiteState
            requirements={prerequisites}
            onRefresh={onRefreshPrerequisites}
          />
        ) : (
          <>
            <CustomizableTable
              getRowAction={(row) =>
                !busy && row.paymentTermVersionId && settings.permissions.termsRead
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
              tableContainerProps={
                fillHeight && !lines.length
                  ? { sx: { '& .simplebar-content': { height: 1 } } }
                  : undefined
              }
              noDataText={
                writable ? 'No fee heads added.' : 'No fee heads are configured for this structure.'
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
                      {row.categoryName && (
                        <Typography variant="caption" color="text.secondary">
                          {row.categoryName}
                        </Typography>
                      )}
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
                  id: 'isOptional',
                  label: 'Required',
                  minWidth: 120,
                  isFilter: false,
                  isSort: false,
                  render: (value) => (value === true ? 'Optional' : 'Required'),
                },
                {
                  id: 'isVariable',
                  label: 'Amount type',
                  minWidth: 112,
                  isFilter: false,
                  isSort: false,
                  render: (value) => (value === true ? 'Variable' : 'Static'),
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
                        row.amountError
                          ? `${validationId}-${row.feeHeadId}-amount-error`
                          : undefined
                      }
                      tabIndex={row.amountError ? -1 : undefined}
                    >
                      <Typography
                        variant="body2"
                        color={row.amountError ? 'error.main' : 'text.primary'}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {row.isVariable
                          ? 'Set during assignment'
                          : row.amount == null
                            ? 'Not set'
                            : structureMoney(row.amount)}
                      </Typography>
                      {row.monthlyRate != null && (
                        <Typography variant="caption" color="text.secondary">
                          {structureMoney(row.monthlyRate)} / month
                        </Typography>
                      )}
                      {row.amountError && (
                        <FormHelperText
                          error
                          id={`${validationId}-${row.feeHeadId}-amount-error`}
                          sx={{ m: 0, textAlign: 'left' }}
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
                        {row.paymentTermId && row.paymentTermVersionId
                          ? row.paymentTermName || 'Attached payment frequency'
                          : 'Not selected'}
                      </Typography>
                      {row.scheduleMode === 'Customized' && (
                        <Typography variant="caption" color="text.secondary">
                          Customized installments
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
                ...(writable
                  ? ([
                      {
                        id: 'actions',
                        label: 'Actions',
                        width: 128,
                        minWidth: 128,
                        maxWidth: 128,
                        align: 'center',
                        sticky: true,
                        stickyPosition: 'right',
                        isFilter: false,
                        isSort: false,
                        excludeFromExport: true,
                        render: (_value, row) => (
                          <AdaptiveThreeDotsActions
                            directActionLimit={2}
                            collapseOnOverflow={false}
                            moreLabel={`More actions for ${row.feeHeadName}`}
                            sx={{ justifyContent: 'center' }}
                            actions={[
                              ...(writable
                                ? [
                                    {
                                      id: 'edit',
                                      label: `Edit ${row.feeHeadName}`,
                                      icon: GlobalIcons.edit,
                                      tooltip: 'Edit Fee Head',
                                      disabled: busy,
                                      onClick: () => {
                                        setEditingLine(
                                          candidate.feeHeads.find(
                                            (line) => line.feeHeadId === row.feeHeadId
                                          )
                                        );
                                        dialog.onTrue();
                                      },
                                    },
                                    {
                                      id: 'remove',
                                      label: `Delete ${row.feeHeadName}`,
                                      icon: GlobalIcons.delete,
                                      tooltip: 'Delete Fee Head',
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
                    ] satisfies IColumn[])
                  : []),
              ]}
            />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={1}
              sx={{ borderTop: 1, borderColor: 'divider', pt: 2, flexShrink: 0 }}
            >
              <Typography variant="subtitle2">Total annual amount</Typography>
              <Typography variant="h6">{structureMoney(total)}</Typography>
            </Stack>
          </>
        )}
      </FormSectionCard>
      {prerequisites.length > 0 && candidate.feeHeads.length > 0 && (
        <FinancePrerequisiteState requirements={prerequisites} onRefresh={onRefreshPrerequisites} />
      )}
      {(dialog.value || adding) && (
        <FeeStructureHeadDialog
          scope={scope}
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
            Delete Fee Head
          </Button>
        }
      />
    </Stack>
  );
}
