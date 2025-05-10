import React, { useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/myResourceRequest/my-resource-request-data.json';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ResourceRequestReviewDialog from './resourece-request-view-dialog';

import type { IResourceRequestReview } from '../resource-review-request-interface';

const ResourceRequestReviewTable = () => {
  const resourceRequestReviewDialog = useBoolean();

  const [selectedRow, setSelectedRow] = React.useState<IResourceRequestReview | null>(null);
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
                  showViewIcon
                  handleViewClick={() => {
                    setIsEdit(false);
                    setSelectedRow(row as IResourceRequestReview);
                    resourceRequestReviewDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {resourceRequestReviewDialog.value && selectedRow && (
        <CustomDialog
          maxWidth="md"
          open={resourceRequestReviewDialog.value}
          handleClose={() => {
            resourceRequestReviewDialog.onFalse();
          }}
          title={`${selectedRow?.requestStatusType} Request`}
        >
          <ResourceRequestReviewDialog
            data={selectedRow}
            onClose={() => {
              resourceRequestReviewDialog.onFalse();
            }}
            isEdit={isEdit}
            requestStatusType={selectedRow?.requestStatusType}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default ResourceRequestReviewTable;
