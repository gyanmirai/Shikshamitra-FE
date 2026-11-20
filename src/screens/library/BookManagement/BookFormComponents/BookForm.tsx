import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Alert, Button, LinearProgress } from '@mui/material';

import { BookEditor } from './BookEditor';
import { useBookDetailSnapshot } from './useBookDetailSnapshot';
import { getInitialBookData } from '../Components/BookManageInitialValues';

import type { BookSource } from './book-form-model';
import type { IBookPayload } from '../Components/type';

const BookFormStepper = ({
  onClose,
  editData,
  onBusyChange,
}: {
  onClose: (event: unknown, submitted: boolean) => void;
  editData?: (IBookPayload & { id?: string }) | null;
  onBusyChange?: (busy: boolean) => void;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = (currentYear as { id?: string })?.id;
  const query = useBookDetailSnapshot(editData?.id);

  if (editData?.id && !query.snapshot)
    return (
      <>
        {query.loading && <LinearProgress aria-label="Loading book details" />}
        {query.error && (
          <Alert
            severity="error"
            action={
              <Button size="small" disabled={query.loading} onClick={query.retry}>
                Retry
              </Button>
            }
          >
            {query.error || 'Could not load this book. No partial copy data will be edited.'}
          </Alert>
        )}
      </>
    );

  return (
    <BookEditor
      key={editData?.id || 'new'}
      academicYearId={academicYearId}
      onClose={onClose}
      onBusyChange={onBusyChange}
      initialValues={getInitialBookData((query.snapshot || editData) as BookSource | null)}
    />
  );
};

export default BookFormStepper;
