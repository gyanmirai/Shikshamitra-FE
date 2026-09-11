import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useDocumentPermissions() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (action: string) =>
    hasGrantedPermission(permissions, `Students.Admissions.Documents.${action}`);
  return {
    view: granted('View'),
    upload: granted('Upload'),
    original: granted('RecordOriginal'),
    review: granted('Review'),
    waive: granted('Waive'),
    download: granted('Download'),
  };
}
