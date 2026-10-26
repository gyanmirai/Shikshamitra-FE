import type { IColumn } from 'src/components/customizabaleTable/types';

import { Typography } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { plainBuildingDescription } from './initialValues';

import type { IBuilding, IBuildingTableProps } from '../types';

const descriptionText = (value: unknown) =>
  plainBuildingDescription(typeof value === 'string' ? value : '');

export const getBuildingColumns = ({
  onEdit,
  onDelete,
}: Pick<IBuildingTableProps, 'onEdit' | 'onDelete'>): IColumn[] => [
  {
    id: 'buildingName',
    label: 'Building Name',
    rowHeader: true,
    align: 'left',
    isFilter: true,
    filterType: 'string',
    width: '32%',
    minWidth: 220,
    render: (value) => (
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    ),
  },
  {
    id: 'totalFloors',
    label: 'Total Floors',
    align: 'left',
    isFilter: true,
    filterType: 'number',
    filterStep: 1,
    width: 160,
    minWidth: 160,
    render: (value) => <Typography variant="body2">{value}</Typography>,
  },
  {
    id: 'description',
    label: 'Description',
    align: 'left',
    isFilter: true,
    filterType: 'string',
    minWidth: 280,
    searchValue: descriptionText,
    filterValue: descriptionText,
    sortValue: descriptionText,
    exportValue: descriptionText,
    render: (value) => (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
      >
        {descriptionText(value) || '-'}
      </Typography>
    ),
  },
  {
    id: 'action',
    label: 'Actions',
    width: 104,
    minWidth: 104,
    maxWidth: 104,
    align: 'left',
    isSort: false,
    isFilter: false,
    sticky: true,
    stickyPosition: 'right',
    excludeFromExport: true,
    render: (_value, row) => {
      const building = row as IBuilding;
      return (
        <AdaptiveThreeDotsActions
          directActionLimit={2}
          collapseOnOverflow={false}
          moreLabel={`More actions for ${building.buildingName}`}
          sx={{ justifyContent: 'flex-end' }}
          actions={[
            {
              id: 'edit',
              label: `Edit ${building.buildingName}`,
              icon: GlobalIcons.edit,
              onClick: () => onEdit(building),
            },
            {
              id: 'delete',
              label: `Delete ${building.buildingName}`,
              icon: GlobalIcons.delete,
              color: 'error.main',
              onClick: () => onDelete(building),
            },
          ]}
        />
      );
    },
  },
];
