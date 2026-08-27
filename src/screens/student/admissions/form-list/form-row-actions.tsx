import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

type Props = {
  form: AdmissionForm;
  canManage: boolean;
  canPublish: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onClone: () => void;
  onValidate: () => void;
  onPublish: () => void;
  onCreateVersion: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function FormRowActions({ form, canManage, canPublish, onPreview, onEdit, onClone, onValidate, onPublish, onCreateVersion, onArchive, onDelete }: Props) {
  return (
    <ThreeDotsActions
      placement="right-top"
      moreLabel={`More actions for ${form.name}`}
      showViewIcon
      viewIcon="mdi:eye-outline"
      viewLabel="Preview form"
      handleViewClick={onPreview}
      actions={({ popover }) => {
        const run = (action: () => void) => { popover.onClose(); action(); };
        return (
          <MenuList>
            {canManage && <MenuItem onClick={() => run(onEdit)}><Iconify icon="mdi:pencil-outline" /> Edit draft</MenuItem>}
            {canManage && <MenuItem onClick={() => run(onClone)}><Iconify icon="mdi:content-copy" /> Clone as draft</MenuItem>}
            {canManage && <MenuItem onClick={() => run(onValidate)}><Iconify icon="mdi:check-decagram-outline" /> Validate</MenuItem>}
            {canPublish && form.status === 0 && <MenuItem onClick={() => run(onPublish)}><Iconify icon="mdi:publish" /> Publish</MenuItem>}
            {canManage && form.status === 0 && <MenuItem onClick={() => run(onDelete)}><Iconify icon="mdi:delete-outline" color="error.main" /> Delete draft</MenuItem>}
            {canPublish && form.status === 1 && <MenuItem onClick={() => run(onCreateVersion)}><Iconify icon="mdi:source-branch-plus" /> New version</MenuItem>}
            {canPublish && form.status === 1 && <MenuItem onClick={() => run(onArchive)}><Iconify icon="mdi:archive-outline" /> Archive</MenuItem>}
          </MenuList>
        );
      }}
    />
  );
}
