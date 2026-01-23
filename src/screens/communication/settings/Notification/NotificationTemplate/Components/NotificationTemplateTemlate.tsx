import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import communicationData from '../../../../../../../communicationData.json';

import type { ITemplateTableProps, INotificationTemplate } from './type';

const NotificationTemplateTable: React.FC<ITemplateTableProps> = ({
  data,
  isLoading,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'templateName',
        label: 'Name',
        align: 'left',
        sticky: true,
      },
      {
        id: 'hashtags',
        label: 'Hashtags',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {Array.isArray(value) && value.length > 0
              ? value.map((tag) => `${tag}`).join(' ')
              : '--'}
          </Typography>
        ),
      },
      {
        id: 'targetRole',
        label: 'Target Role',
        align: 'left',
      },
      {
        id: 'subject',
        label: 'Subject',
        align: 'left',
      },
      {
        id: 'message',
        label: 'Message',
        align: 'left',
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
                onDelete(row as INotificationTemplate);
              }}
              handleEditClick={() => {
                onEdit(row as INotificationTemplate);
              }}
            />
          );
        },
      },
    ],
    [onDelete, onEdit]
  );
  return (
    <CustomizableTable
      tableId="template-data-table"
      isLoading={isLoading}
      noDataText={
        <>
          No template data found.
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
              setOpenDialog(true);
              setEditData(null);
            }}
          >
            Add Template
          </Typography>
        </>
      }
      columns={columns}
      data={communicationData?.notificationTemplateData || []}
    />
  );
};

export default NotificationTemplateTable;
