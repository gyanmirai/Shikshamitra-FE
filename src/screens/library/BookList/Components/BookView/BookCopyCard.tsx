import type { IBookCopy } from 'src/screens/library/BookManagement/Components/type';
import type { CopyActionCallbacks } from 'src/screens/library/circulation/copy-actions';

import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { Stack, Typography } from '@mui/material';
import { Label, type LabelColor } from 'src/components/label';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status';

import { BookCopyActions } from '../../../circulation/BookCopyActions';

const labelTypographyProps = {
  sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'text.secondary' },
};
export default function BookCopyCard({
  copy,
  bookId,
  ...callbacks
}: CopyActionCallbacks & { copy: IBookCopy; bookId: string }) {
  const fields = [
    ['Library section', copy.section],
    ['Shelf', copy.shelf],
    ...(copy.memberId
      ? [
          ['Current borrower', copy.memberName],
          ['Role', copy.role === 'Employee' ? 'Staff' : copy.role],
          ['Issued on', fDate(copy.issueDate)],
          ['Due on', fDate(copy.dueDate)],
        ]
      : []),
    ...(copy.remarks ? [['Remarks', copy.remarks]] : []),
  ];
  const status =
    copy.status === LibraryBookStatus.UnderMaintenance
      ? 'Under repair'
      : copy.status === LibraryBookStatus.Removed
        ? 'Discarded'
        : LibraryBookStatus[copy.status];
  return (
    <FormSectionCard
      title={copy.accessionNo}
      icon={GlobalIcons.bookIcon}
      descriptionTooltip="Saved copy location and current borrowing details visible in your scope. Borrowing history is a separate scoped view."
      actionFullWidthOnMobile
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Label color={LibraryBookStatusColors[copy.status] as LabelColor}>{status}</Label>
          <BookCopyActions bookId={bookId} copy={copy} {...callbacks} />
        </Stack>
      }
    >
      <DetailGrid desktopColumns={2}>
        {fields.map(([label, value]) => (
          <DetailField
            key={String(label)}
            label={String(label)}
            value={value}
            labelTypographyProps={labelTypographyProps}
          />
        ))}
      </DetailGrid>
      {!copy.memberId && (
        <Typography variant="body2" color="text.secondary">
          {copy.status === LibraryBookStatus.Issued || copy.status === LibraryBookStatus.Overdue
            ? 'Current borrower details are unavailable in your scope.'
            : 'No current borrower details.'}
        </Typography>
      )}
    </FormSectionCard>
  );
}
