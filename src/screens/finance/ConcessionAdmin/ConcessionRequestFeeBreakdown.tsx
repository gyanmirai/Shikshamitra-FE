import type { IData, IColumn } from 'src/components/customizabaleTable/types';
import type {
  ConcessionRequestDetail,
  ConcessionApprovalContext,
} from 'src/redux/finance/ConcessionManagement/types';

import { useId, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { DetailField } from 'src/components/detail-view';
import CustomAccordion from 'src/components/custom-accordian';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Alert, Divider, Typography, AccordionSummary } from '@mui/material';
import { ConcessionRequestStatusEnum } from 'src/redux/finance/ConcessionManagement/types';

import { concessionInstallmentLabel } from '../Concession/Components/concessionInstallmentLabel';

export default function ConcessionRequestFeeBreakdown({
  detail,
  context,
}: {
  detail: ConcessionRequestDetail;
  context?: ConcessionApprovalContext;
}) {
  const accordionId = useId();
  const [collapsedHeadIds, setCollapsedHeadIds] = useState<string[]>([]);
  const approved = [
    ConcessionRequestStatusEnum.APPROVED,
    ConcessionRequestStatusEnum.PARTIALLY_REVERSED,
    ConcessionRequestStatusEnum.REVERSED,
  ].includes(detail.status);
  const pending = [ConcessionRequestStatusEnum.DRAFT, ConcessionRequestStatusEnum.PENDING].includes(
    detail.status
  );
  const reversed = approved && detail.totalReversedConcessionAmount > 0;
  // Saved due inputs may be percentages; only context/allocation amounts are INR.
  const savedDueInputs = new Map(
    (detail.dueFeeConcessions ?? []).map((line) => [line.dueFeeId, line.amount])
  );
  const hasSavedInstallments = savedDueInputs.size > 0;
  const amountLabel = approved
    ? 'Concession applied'
    : pending
      ? 'Proposed concession'
      : 'Requested concession';
  const money = (value: number | null | undefined) =>
    value == null ? '—' : formatNumber(value, 'INR');
  const moneyColumn = (id: string, label: string): IColumn => ({
    id,
    label,
    align: 'right',
    minWidth: 110,
    render: money,
    isFilter: false,
    isSort: false,
    cellSx: { fontVariantNumeric: 'tabular-nums' },
  });
  const columns: IColumn[] = [
    {
      id: 'installment',
      label: 'Instalment',
      minWidth: 150,
      rowHeader: true,
      isFilter: false,
      isSort: false,
    },
    moneyColumn('originalAmount', 'Original fee'),
    ...(hasSavedInstallments
      ? [
          {
            id: 'requestedInput',
            label: 'Requested value',
            align: 'right' as const,
            minWidth: 110,
            isFilter: false,
            isSort: false,
            render: (value: number | undefined, row: IData) =>
              value == null ? '—' : row.basedOn === 1 ? `${String(value)}%` : money(value),
          },
        ]
      : []),
    moneyColumn('amount', amountLabel),
    ...(reversed
      ? [moneyColumn('reversedAmount', 'Reversed'), moneyColumn('netAmount', 'Net concession')]
      : []),
  ];

  return (
    <Stack spacing={2}>
      {!approved && !pending && (
        <Typography variant="body2" color="text.secondary">
          No concession was applied to this {detail.statusName.toLowerCase()} request.
        </Typography>
      )}
      {pending && context?.hasChangedSinceSubmission && (
        <Alert severity="warning">
          Fee balances or policy calculations have changed since submission. Proposed amounts are
          current estimates; this request has not been approved.
        </Alert>
      )}
      {detail.feeHeadConcessions.map((head) => {
        const group = context?.feeHeadGroups.find((item) => item.feeHeadId === head.feeHeadId);
        const lines = (group?.dueFeeLines ?? []).filter((line) =>
          approved
            ? line.appliedConcessionAmount > 0 || line.reversedConcessionAmount > 0
            : hasSavedInstallments
              ? savedDueInputs.has(line.dueFeeId)
              : pending && line.suggestedConcessionAmount > 0
        );
        const rows = lines.map((line) => ({
          id: line.dueFeeId,
          installment: concessionInstallmentLabel(
            line.installmentLabel || line.monthLabel,
            line.year
          ),
          originalAmount: line.originalAmount,
          amount: approved ? line.appliedConcessionAmount : line.suggestedConcessionAmount,
          requestedInput: savedDueInputs.get(line.dueFeeId),
          basedOn: head.basedOn,
          reversedAmount: line.reversedConcessionAmount,
          netAmount: line.reversibleConcessionAmount,
        }));
        const total = approved
          ? rows.length
            ? rows.reduce((sum, row) => sum + row.amount, 0)
            : null
          : head.discountAmount;
        const expanded = !collapsedHeadIds.includes(head.feeHeadId);
        const panelId = `${accordionId}-${head.feeHeadId}`;
        return (
          <Box
            component="section"
            role="region"
            aria-label={`${head.feeHeadName} breakdown`}
            key={head.feeHeadId}
            sx={{
              minWidth: 0,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.shadows[2],
            }}
          >
            <CustomAccordion
              title={head.feeHeadName}
              expanded={expanded}
              onChange={() =>
                setCollapsedHeadIds((ids) =>
                  expanded ? [...ids, head.feeHeadId] : ids.filter((id) => id !== head.feeHeadId)
                )
              }
              summary={
                <AccordionSummary
                  id={`${panelId}-toggle`}
                  aria-controls={panelId}
                  aria-label={`${head.feeHeadName} fee breakdown`}
                  expandIcon={<Iconify icon={GlobalIcons.expandMore} />}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    gap={1}
                    sx={{ flex: 1, minWidth: 0, pr: 1 }}
                  >
                    <Box
                      sx={{
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        component="span"
                        color="text.primary"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {head.feeHeadName}
                      </Typography>
                      {!hasSavedInstallments && (
                        <Typography variant="caption" color="text.secondary">
                          Requested value:{' '}
                          <Box component="span">
                            {head.basedOn === 1 ? `${head.amount}%` : money(head.amount)}
                          </Box>
                        </Typography>
                      )}
                    </Box>
                    <DetailField
                      layout="inline"
                      label={approved ? 'Applied subtotal' : 'Requested subtotal'}
                      value={money(total)}
                    />
                  </Stack>
                </AccordionSummary>
              }
              content={
                <Box id={panelId}>
                  {rows.length > 0 ? (
                    <CustomizableTable
                      tableId={`concession-detail-${detail.concessionRequestId}-${head.feeHeadId}`}
                      tableTitle={`${head.feeHeadName} instalments`}
                      variant="embedded"
                      columns={columns}
                      data={rows}
                      showToolbar={false}
                      showColumns={false}
                      showExport={false}
                      showFullScreen={false}
                      isSearch={false}
                      isFilter={false}
                      isPagination={false}
                      isShowedDense={false}
                      wrapperProps={{ sx: { flex: '0 0 auto', minWidth: 0 } }}
                      tableContainerProps={{ sx: { height: 'auto' } }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {approved
                        ? 'Saved instalment allocations are unavailable.'
                        : 'No saved instalment breakdown is available for this request.'}
                    </Typography>
                  )}
                  {pending && rows.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <DetailField
                        layout="inline"
                        label="Proposed subtotal"
                        value={money(rows.reduce((sum, row) => sum + row.amount, 0))}
                      />
                    </Box>
                  )}
                </Box>
              }
            />
          </Box>
        );
      })}
      {detail.feeHeadConcessions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No fee heads recorded for this request.
        </Typography>
      )}
      <Divider />
      <DetailField
        layout="inline"
        label={approved ? 'Total concession applied' : 'Total requested concession'}
        value={money(
          approved ? detail.totalApprovedConcessionAmount : detail.totalRequestedConcessionAmount
        )}
      />
      {reversed && (
        <>
          <DetailField
            layout="inline"
            label="Total reversed"
            value={money(detail.totalReversedConcessionAmount)}
          />
          <DetailField
            layout="inline"
            label="Net concession"
            value={money(detail.netApprovedConcessionAmount)}
          />
        </>
      )}
    </Stack>
  );
}
