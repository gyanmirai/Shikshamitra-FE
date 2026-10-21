import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { documentCategories } from '../types';

import type { SchoolDocument } from '../types';
import type { DocumentWorkspace } from '../hooks/use-document-workspace';

export function documentTableColumns(workspace: DocumentWorkspace): IColumn[] {
  const { permissions } = workspace;
  const columns: IColumn[] = [
    { id: 'name', label: 'Document Name', minWidth: 220, isSort: true },
    {
      id: 'category',
      label: 'Category',
      minWidth: 170,
      render: (value: number) =>
        documentCategories.find((item) => item.value === value)?.label ?? 'Other',
    },
    {
      id: 'files',
      label: 'Files',
      width: 85,
      render: (_value: unknown, row: IData) => (row as SchoolDocument).files.length,
    },
    { id: 'uploadedBy', label: 'Uploaded By', minWidth: 150 },
    {
      id: 'creationTime',
      label: 'Uploaded On',
      minWidth: 165,
      isSort: true,
      render: (value: string) => fDateTime(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 120,
      excludeFromExport: true,
      render: (_value: unknown, row: IData) => {
        const document = row as SchoolDocument;
        return (
          <AdaptiveThreeDotsActions
            moreLabel={`More actions for ${document.name}`}
            actions={[
              {
                id: 'view',
                label: 'View',
                icon: GlobalIcons.eye,
                onClick: () => workspace.setSelection({ id: document.id, mode: 'view' }),
              },
              ...(permissions.canAdd
                ? [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: GlobalIcons.edit,
                      onClick: () => workspace.setSelection({ id: document.id, mode: 'edit' }),
                    },
                  ]
                : []),
              ...(permissions.canDelete
                ? [
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: GlobalIcons.delete,
                      color: 'error.main',
                      onClick: () => workspace.setDeleting(document),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];
  return columns.map((column) => ({ isFilter: false, isSort: false, ...column }));
}
