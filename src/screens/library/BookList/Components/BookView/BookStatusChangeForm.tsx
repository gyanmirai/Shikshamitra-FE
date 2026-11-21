import type { RootState } from 'src/redux/store';
import type { IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Alert, Button, LinearProgress } from '@mui/material';

import { CopyStatusEditor } from '../../../circulation/CopyStatusEditor';
import { useCopyStateSession } from '../../../circulation/useCopyStateSession';

export default function ChangeBookStatusForm({
  editData,
  onClose,
  onBusyChange,
}: {
  editData: IBookCopyWithBook | null;
  onClose: (event: unknown, submitted: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Library.AllBooks.View');
  const canUpdate = hasGrantedPermission(permissions, 'Library.AllBooks.Update');
  const { query, snapshot, retry } = useCopyStateSession(
    { bookId: editData?.book.id || '', copyId: editData?.copyId || '' },
    canView
  );
  if (!editData?.copyId) return <Alert severity="info">Select a saved book copy.</Alert>;
  if (!canView)
    return (
      <Alert severity="info">
        Catalogue view permission is required to load the current copy state.
      </Alert>
    );
  return (
    <>
      {query.isFetching && <LinearProgress aria-label="Loading current copy state" />}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          Could not load the current copy state. Your draft is retained if this editor is already
          open.
        </Alert>
      )}
      {snapshot && (
        <CopyStatusEditor
          key={`${editData.book.id}:${editData.copyId}`}
          state={snapshot}
          canUpdate={canUpdate}
          onClose={onClose}
          onBusyChange={onBusyChange}
        />
      )}
    </>
  );
}
