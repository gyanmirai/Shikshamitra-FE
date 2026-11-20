import type { ReactNode } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import { Stack, Avatar, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import { MemberOverdueValue } from '../../circulation/MemberOverdueValue';

import type { IMember } from './type';

const labelStyle = {
  sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'text.secondary' },
};

export function MemberProfile({ member }: { member: IMember }) {
  const overdueValue = <MemberOverdueValue count={member.overdueReturn} classification={member} />;
  const fields: [string, ReactNode][] = [
    ['Member ID', member.memberIdentifier || member.memberId || member.id],
    ['Role', member.role],
    ['Contact number', member.contactNo || member.phone],
    ['Email', member.email],
    ['Current issues', member.currentIssue],
    ['Overdue books', overdueValue],
    ['Reserved books', member.reservedBooks],
  ];
  if (member.role === 'Student')
    fields.push(
      [
        'Class/division',
        member.classDivision || [member.class, member.division].filter(Boolean).join(' / '),
      ],
      ['Roll number', member.rollNo],
      ['GR number', member.grNo]
    );

  return (
    <FormSectionCard
      title="Member Information"
      icon={GlobalIcons.studentProfile}
      descriptionTooltip="Current identity with borrowing totals limited to the loan and reservation records you can access."
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar src={member.avatar || undefined} alt={member.name || 'Library member'} />
        <Typography variant="body2">{member.name || 'Name unavailable'}</Typography>
      </Stack>
      <DetailGrid>
        {fields.map(([label, value]) => (
          <DetailField
            key={label}
            label={String(label)}
            value={value}
            labelTypographyProps={labelStyle}
          />
        ))}
      </DetailGrid>
    </FormSectionCard>
  );
}
