import type { FormikProps } from 'formik';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status';

import { CopyLocationField } from './CopyLocationField';
import { CopyAccessionField } from './CopyAccessionField';
import { CopyReceivingProvenance } from './CopyReceivingProvenance';
import { copyRemovalReason, canRemoveCatalogueCopy } from './copy-removal';

import type { LibrarySectionOption } from './CopyLocationField';
import type { IBookCopy, BookFormValues } from '../Components/type';

type CopyRow = IBookCopy & { rowIndex: number };

export function BookCopiesTable({
  formik,
  sections,
  disabled,
  onRemove,
}: {
  formik: FormikProps<BookFormValues>;
  sections: LibrarySectionOption[];
  disabled: boolean;
  onRemove: (index: number) => void;
}) {
  const sourceCopy = (row: CopyRow) => formik.values.copies[row.rowIndex];
  const columns: IColumn[] = [
    { id: 'copyNo', label: 'Copy number', isSort: false, minWidth: 100 },
    {
      id: 'accessionNo',
      label: 'Accession number',
      minWidth: 240,
      isSort: false,
      render: (_, row) => (
        <CopyAccessionField formik={formik} index={(row as CopyRow).rowIndex} disabled={disabled} />
      ),
    },
    ...(['section', 'shelf'] as const).map((field) => ({
      id: field,
      label: field === 'section' ? 'Section' : 'Shelf',
      minWidth: 200,
      isSort: false,
      render: (_: unknown, row: Record<string, unknown>) => (
        <CopyLocationField
          formik={formik}
          index={row.rowIndex as number}
          field={field}
          sections={sections}
          disabled={disabled}
        />
      ),
    })),
    {
      id: 'status',
      label: 'Status',
      minWidth: 140,
      isSort: false,
      render: (value: LibraryBookStatus) => (
        <Label
          color={
            LibraryBookStatusColors[value] as 'success' | 'info' | 'warning' | 'error' | 'default'
          }
        >
          {LibraryBookStatus[value]}
        </Label>
      ),
    },
    {
      id: 'receivingReceiptId',
      label: 'Receiving record',
      minWidth: 180,
      isSort: false,
      render: (_, row) => <CopyReceivingProvenance copy={sourceCopy(row as CopyRow)} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 80,
      isSort: false,
      isFilter: false,
      sticky: true,
      render: (_, row) => (
        <AdaptiveThreeDotsActions
          directActionLimit={1}
          actions={[
            {
              id: 'remove',
              label: `Remove copy ${row.copyNo}`,
              icon: GlobalIcons.delete,
              disabled: disabled || !canRemoveCatalogueCopy(sourceCopy(row as CopyRow)),
              tooltip: copyRemovalReason(sourceCopy(row as CopyRow)),
              onClick: () => onRemove((row as CopyRow).rowIndex),
            },
          ]}
        />
      ),
    },
  ];
  return (
    <CustomizableTable
      tableId="library-editable-book-copies"
      variant="embedded"
      tableTitle="Book copies"
      columns={columns}
      data={formik.values.copies.map((copy, rowIndex) => ({
        ...copy,
        rowIndex,
        id: copy.copyId || copy.id || `draft-${copy.copyNo}`,
      }))}
      isSearch={false}
      isFilter={false}
      showExport={false}
      noDataText="Add a copy to assign its accession number and location."
    />
  );
}
