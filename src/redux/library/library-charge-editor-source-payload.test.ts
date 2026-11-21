import { it, expect, describe } from 'vitest';
import { buildCreateChargePayload } from 'src/redux/library/library-adapters';

const memberId = '5c68d95f-73ba-4207-a337-71e6396ffec7';
const loanId = 'a5431f16-8f43-45f2-a93b-fb74b9edb176';
const accession = 'ACC-0042';
const validAssessment = {
  memberId,
  academicYearId: '268cd088-b405-4325-8749-365e6778ab33',
  chargeCategory: 'b2469347-174e-4d65-af7e-c08d3bc39021',
  amount: '100.75',
  schoolChargeDate: '2026-11-17',
  schoolDueDate: '2026-11-24',
  reason: 'Reviewed actual loan-linked damage assessment.',
};

describe('owning charge editor source payload', () => {
  it('retains the explicitly selected server loan identity rather than deriving one from an accession', () => {
    const payload = buildCreateChargePayload({
      ...validAssessment,
      bookIssueId: loanId,
      bookNumber: accession,
    });

    expect(payload).toMatchObject({ memberId, bookIssueId: loanId, amount: 100.75 });
    expect(payload).not.toHaveProperty('bookIssueId', accession);
    expect(payload).not.toHaveProperty('bookNumber');
  });

  it('keeps an ordinary direct assessment unlinked when no server loan source was selected', () => {
    const payload = JSON.parse(
      JSON.stringify(
        buildCreateChargePayload({
          ...validAssessment,
          bookNumber: accession,
        })
      )
    ) as Record<string, unknown>;

    expect(payload).toMatchObject({ memberId, amount: 100.75 });
    expect(payload).not.toHaveProperty('bookIssueId');
    expect(payload).not.toHaveProperty('bookNumber');
  });
});
