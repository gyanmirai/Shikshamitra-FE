import type { FormikProps } from 'formik';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Alert, Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';

import { CopySettings } from './CopySettings';
import { BookCopiesTable } from './BookCopiesTable';
import { canRemoveCatalogueCopy } from './copy-removal';
import { useBookEditorOptions } from './useBookEditorOptions';
import { SavedCopyLabelsDialog } from './SavedCopyLabelsDialog';

import type { BookFormValues } from '../Components/type';
import type { LibrarySectionOption } from './CopyLocationField';

const BookCopiesStep = ({
  formik,
  disabled,
  printDisabled = false,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
  printDisabled?: boolean;
}) => {
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const query = useBookEditorOptions();
  const sections: LibrarySectionOption[] = query.currentData?.sections || [];
  const remove = () => {
    if (removeIndex === null || !canRemoveCatalogueCopy(formik.values.copies[removeIndex])) return;
    const copies = formik.values.copies.filter((_, index) => index !== removeIndex);
    formik.setValues({ ...formik.values, copies, numberOfCopies: String(copies.length) });
    setRemoveIndex(null);
  };
  return (
    <Stack spacing={2}>
      <CopySettings
        formik={formik}
        disabled={disabled}
        printDisabled={printDisabled}
        onLabels={() => setLabelsOpen(true)}
      />
      <FormSectionCard
        title="Copy Locations"
        icon={GlobalIcons.building}
        descriptionTooltip="Assign locations for new copies. Saved copies remain when receiving or circulation evidence prevents removal. Use Inventory actions for supported lifecycle changes."
      >
        {!query.canRead && (
          <Alert severity="info">
            Catalogue view and add or update permission are required to load copy locations.
          </Alert>
        )}
        {!query.academicYearId && (
          <Alert severity="info">Select an academic year to load copy locations.</Alert>
        )}
        {query.currentData && !sections.length && (
          <Alert severity="info">
            No Library sections and shelves are configured. Ask an authorized user to configure a
            location before adding stock.
          </Alert>
        )}
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load sections and shelves. Existing location values are retained.
          </Alert>
        )}
        {typeof formik.errors.copies === 'string' && (
          <Alert severity="error">{formik.errors.copies}</Alert>
        )}
        <BookCopiesTable
          formik={formik}
          sections={sections}
          disabled={disabled || query.isFetching || !query.currentData || !query.canRead}
          onRemove={setRemoveIndex}
        />
      </FormSectionCard>
      <ConfirmDialog
        open={removeIndex !== null}
        title="Remove Copy?"
        onClose={() => setRemoveIndex(null)}
        content="This removes the row from your draft. Saving rechecks its removal eligibility. Receiving, circulation and condition records must be retained; use the copy's supported Inventory actions instead."
        action={
          <Button
            type="button"
            size="small"
            color="error"
            variant="contained"
            disabled={
              disabled ||
              removeIndex === null ||
              !canRemoveCatalogueCopy(formik.values.copies[removeIndex])
            }
            onClick={remove}
          >
            Remove copy
          </Button>
        }
      />
      {labelsOpen && (
        <SavedCopyLabelsDialog
          open
          bookId={formik.values.id}
          onClose={() => setLabelsOpen(false)}
        />
      )}
    </Stack>
  );
};
export default BookCopiesStep;
