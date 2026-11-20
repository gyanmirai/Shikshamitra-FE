import type {
  ChargeEditorLoan,
  ChargeEditorMember,
} from 'src/redux/library/charges-management/charge-editor-types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { ChargeEditorLoanField } from './ChargeEditorLoanField';
import { ChargeEditorMemberField } from './ChargeEditorMemberField';
import { ChargeEditorCategoryField } from './ChargeEditorCategoryField';

import type { ChargeEditorFieldProps } from './charge-editor-field-types';

export { ChargeSavedSource } from './ChargeSavedSource';

export function ChargeCreateSource({
  formik,
  disabled,
  onFixedChange,
}: ChargeEditorFieldProps & { onFixedChange: (fixed: boolean) => void }) {
  const [member, setMember] = useState<ChargeEditorMember | null>(null);
  const [loan, setLoan] = useState<ChargeEditorLoan | null>(null);
  return (
    <FormSectionCard
      title="Assessment Source"
      icon={GlobalIcons.issueBook}
      descriptionTooltip="Find an authorized borrower by name or member ID. Select a specific recorded loan when the assessment relates to it; an accession search alone does not select a loan."
    >
      <Stack spacing={2}>
        <ChargeEditorMemberField
          formik={formik}
          disabled={disabled}
          member={member}
          onClear={() => {
            setMember(null);
            setLoan(null);
            formik.setValues({
              ...formik.values,
              memberId: '',
              bookIssueId: '',
              bookNumber: '',
              bookTitle: '',
              requiresLoanSource: false,
            });
          }}
          onSelect={(selected) => {
            setMember(selected);
            setLoan(null);
            formik.setValues({
              ...formik.values,
              memberId: selected?.id || '',
              role: selected?.role === 0 ? 'Student' : 'Staff',
              bookIssueId: '',
              bookNumber: '',
              bookTitle: '',
              requiresLoanSource: Boolean(selected?.requiresLoanSource),
            });
          }}
        />
        {member && <Typography variant="body2">{member.memberName}</Typography>}
        {member && (
          <ChargeEditorLoanField
            formik={formik}
            disabled={disabled}
            member={member}
            loan={loan}
            setLoan={setLoan}
          />
        )}
        <ChargeEditorCategoryField
          formik={formik}
          disabled={disabled}
          onFixedChange={onFixedChange}
        />
      </Stack>
    </FormSectionCard>
  );
}
