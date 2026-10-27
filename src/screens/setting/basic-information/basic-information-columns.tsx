import type { IColumn } from 'src/components/customizabaleTable/types';

import { IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';

import type { TenantRecord } from './types';

export function basicInformationColumns(
  onEdit: (record: TenantRecord) => void,
  onViewAsset: (images: string[]) => void
): IColumn[] {
  const assets = [
    { label: 'Institute Logo', id: 'extraProperties.Logo' },
    { label: 'Institute Banner', id: 'extraProperties.Banner' },
    { label: 'Principle Sign', id: 'extraProperties.PrincipleSign' },
  ].map((column): IColumn => ({
    ...column,
    render: (value: unknown) => {
      const images = Array.isArray(value)
        ? value.filter((image): image is string => typeof image === 'string')
        : [];
      return (
        <IconButton
          disabled={!images.length}
          onClick={() => onViewAsset(images)}
          aria-label={`View ${column.label}`}
        >
          <Iconify
            icon="carbon:view-filled"
            sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          />
        </IconButton>
      );
    },
  }));
  return [
    { label: 'Institute Name', id: 'name' },
    ...assets,
    { label: 'Address', id: 'extraProperties.Address1' },
    { label: 'Country', id: 'extraProperties.Country.name' },
    { label: 'State', id: 'extraProperties.State.name' },
    { label: 'City', id: 'extraProperties.City' },
    { label: 'ZIP/Postal Code', id: 'extraProperties.PostalCode' },
    { label: 'Contact Number', id: 'extraProperties.ContactNumber' },
    {
      label: 'Action',
      id: 'action',
      sticky: true,
      isSort: false,
      isFilter: false,
      render: (_value, row) => (
        <ThreeDotsActions
          showEditIcon
          handleEditClick={() => onEdit(row as TenantRecord)}
          showThreeDots={false}
        />
      ),
    },
  ];
}
