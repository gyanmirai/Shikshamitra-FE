import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/myResourceRequest/my-resource-request-data.json';
import {
  ResourceStatusType,
  ResourceStatusTypeColors,
  ResourceStatusTypeOptions,
} from 'src/enums/resource-statusType';

import { Label } from 'src/components/label';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ResourceRequestDetailedView from './resource-request-detaild-view';

import type {
  IMyRequestResource,
  IMyRequestResourceTableProps,
} from '../my-resource-request-interface';

const MyResourceRequestTable: React.FC<IMyRequestResourceTableProps> = ({ onClick }) => {
  const resourceRequestViewDialog = useBoolean();
  const deleteItem = useBoolean();

  const [selectedRow, setSelectedRow] = React.useState<IMyRequestResource | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  return (
    <>
      <CustomizableTable
        tableId="my-resources-request-table"
        searchFieldProps={{
          placeholder: 'Search by Name, Category...',
          label: 'Search by Name, Category...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={<>No Resources Request Found.</>}
        columns={[
          {
            label: 'Name',
            id: 'name',
          },
          {
            label: 'Category',
            id: 'category',
          },
          // {
          //   label: 'Sub-Category',
          //   id: 'subCategory',
          //   minWidth: '120px',
          // },
          // {
          //   label: 'Vendor',
          //   id: 'vendor',
          //   minWidth: '150px',
          // },
          {
            label: 'Request Type',
            id: 'requestStatusType',
          },

          {
            label: 'Status',
            id: 'status',
            minWidth: '100px',
            filterType: 'enum',
            enumOptions: ResourceStatusTypeOptions,
            render(value, row) {
              const color = ResourceStatusTypeColors[value as ResourceStatusType] as LabelColor;

              return <Label color={color}>{ResourceStatusType[value]}</Label>;
            },
          },

          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 100,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showThreeDots={false}
                  showDeleteIcon
                  showEditIcon
                  showViewIcon
                  handleViewClick={() => {
                    setIsEdit(false);
                    setSelectedRow(row as IMyRequestResource);
                    resourceRequestViewDialog.onTrue();
                  }}
                  handleEditClick={() => {
                    setIsEdit(true);
                    setSelectedRow(row as IMyRequestResource);
                    resourceRequestViewDialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setSelectedRow(row as IMyRequestResource);
                    deleteItem.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {resourceRequestViewDialog.value && selectedRow && (
        <CustomDialog
          maxWidth="md"
          open={resourceRequestViewDialog.value}
          handleClose={() => {
            resourceRequestViewDialog.onFalse();
          }}
          title={`${selectedRow?.requestStatusType} Resource Request`}
        >
          <ResourceRequestDetailedView
            data={selectedRow}
            onClose={() => {
              resourceRequestViewDialog.onFalse();
            }}
            isEdit={isEdit}
            requestStatusType={selectedRow?.requestStatusType}
          />
        </CustomDialog>
      )}

      {deleteItem.value && (
        <ConfirmDialog
          open={deleteItem.value}
          onClose={deleteItem.onFalse}
          title="Delete"
          content="Are you sure want to delete?"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                deleteItem.onFalse();
              }}
            >
              Delete
            </Button>
          }
        />
      )}
    </>
  );
};

export default MyResourceRequestTable;
