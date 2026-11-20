import type { FinanceExternalReceivable } from 'src/redux/library/charges-management/finance-external.types';

import dayjs from 'dayjs';
import { Stack, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import type { FinanceAssessment } from './useOpenedFinanceAssessment';

export const financeAmount = (amount: number | string, currency: string) =>
  formatNumber(String(amount), currency, { fractionDigits: 2 });

export function FinanceAssessmentSummary({
  assessment,
  receivable,
}: {
  assessment: FinanceAssessment;
  receivable?: FinanceExternalReceivable;
}) {
  const currency = receivable?.currency || assessment.currency;
  const date = (value?: string | null) =>
    value ? dayjs(value).format('DD MMM YYYY') : 'Not confirmed';
  return (
    <FormSectionCard
      title="Library assessment"
      icon="mdi:book-open-variant"
      descriptionTooltip="The saved borrower, amount and assessment dates identify this obligation. Finance records approval, payment and corrections separately."
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {receivable?.payer.displayName || assessment.memberName || 'Borrower name not recorded'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {receivable
            ? receivable.payer.kind === 1
              ? 'Student'
              : 'Staff'
            : assessment.role === 'Student'
              ? 'Student'
              : 'Staff'}
        </Typography>
        <DetailGrid>
          <DetailField label="Assessment" value={assessment.chargeCategory} />
          <DetailField
            label="Academic year"
            value={
              receivable?.academicYearName || assessment.academicYearName || 'Saved assessment year'
            }
          />
          <DetailField label="Assessment date" value={date(assessment.schoolChargeDate)} />
          <DetailField label="Due date" value={date(assessment.schoolDueDate)} />
          <DetailField
            label="Original assessment"
            value={
              currency
                ? financeAmount(receivable?.originalAmount ?? assessment.fineAmount, currency)
                : 'Currency requires review'
            }
          />
          {receivable && (
            <>
              <DetailField
                label="Finance approval"
                value={
                  receivable.approvalStatus === 1
                    ? 'Approved'
                    : receivable.approvalStatus === 0
                      ? 'Pending approval'
                      : 'Requires Finance review'
                }
              />
              <DetailField
                label="Settled"
                value={financeAmount(receivable.settledPaymentAmount, receivable.currency)}
              />
              <DetailField
                label="Pending verification"
                value={financeAmount(receivable.pendingVerificationAmount, receivable.currency)}
              />
              <DetailField
                label="Waived"
                value={financeAmount(receivable.waivedAmount, receivable.currency)}
              />
              {receivable.financialOutstandingAmount !== undefined && (
                <DetailField
                  label="Financial outstanding"
                  value={financeAmount(receivable.financialOutstandingAmount, receivable.currency)}
                />
              )}
              <DetailField
                label="Collectible"
                value={financeAmount(receivable.outstandingAmount, receivable.currency)}
              />
            </>
          )}
        </DetailGrid>
      </Stack>
    </FormSectionCard>
  );
}
