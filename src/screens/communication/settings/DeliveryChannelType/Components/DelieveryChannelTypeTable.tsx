import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { channelLabel, providerStatusLabel } from 'src/redux/communication/communicationMappers';

import type { IProviderSetting, IProviderSettingTableProps } from '../type';

const YesNo = ({ value }: { value: boolean }) => (
  <Typography variant="caption" color={value ? 'success.main' : 'text.secondary'}>
    {value ? 'Yes' : 'No'}
  </Typography>
);

const DeliveryChannelTable: React.FC<IProviderSettingTableProps> = ({
  data,
  isLoading,
  onAddProvider,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="provider-settings-data-table"
    isLoading={isLoading}
    noDataText={
      <Box display="flex" flexDirection="column">
        No provider settings found.
        <Typography
          component="span"
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            onAddProvider.onTrue();
            setEditData(null);
          }}
        >
          Add Provider Setting
        </Typography>
      </Box>
    }
    columns={[
      {
        id: 'channel',
        label: 'Channel',
        align: 'left',
        render: (value) => channelLabel(value),
      },
      {
        id: 'providerName',
        label: 'Provider',
        align: 'left',
      },
      {
        id: 'senderId',
        label: 'Sender ID',
        align: 'left',
        render: (value) => value || '--',
      },
      {
        id: 'isEnabled',
        label: 'Enabled',
        align: 'left',
        render: (value) => <YesNo value={Boolean(value)} />,
      },
      {
        id: 'isDefault',
        label: 'Default',
        align: 'left',
        render: (value) => <YesNo value={Boolean(value)} />,
      },
      {
        id: 'consentRequired',
        label: 'Consent',
        align: 'left',
        render: (value) => <YesNo value={Boolean(value)} />,
      },
      {
        id: 'templateApprovalRequired',
        label: 'Template Approval',
        align: 'left',
        render: (value) => <YesNo value={Boolean(value)} />,
      },
      {
        id: 'fallbackOrder',
        label: 'Fallback',
        align: 'left',
        render: (value) => (Array.isArray(value) ? value.map(channelLabel).join(' -> ') : '--'),
      },
      {
        id: 'dailyQuota',
        label: 'Daily Quota',
        align: 'left',
        render: (value) => value || '--',
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        render: (value) => providerStatusLabel(value),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IProviderSetting);
              }}
              handleEditClick={() => {
                onEdit(row as IProviderSetting);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default DeliveryChannelTable;
