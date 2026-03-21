import { Box } from '@mui/material';
import React, { useState } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import data from 'src/json/resource-management/resource-settings/vendor/resource-vendor-data.json';

import type {
  IReportVendorTableProps,
  IResourceVendorFormValues,
} from '../resource-vendor-config-interface';

const ResourceVendorTable: React.FC<IReportVendorTableProps> = ({ onClick }) => {
  const [, setSelectedRow] = useState<IResourceVendorFormValues>();

  return (
    <>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Vendor Name',
          label: 'Search by Vendor Name',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Vendor Found{' '}
            <Box
              onClick={() => {
                onClick({} as IResourceVendorFormValues, 'new');
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Vendor
            </Box>
          </>
        }
        tableId="resource-vendor-table"
        columns={[
          { id: 'vendorComponyName', label: 'Vendor Compony Name' },
          { id: 'vendorName', label: 'Vendor Name' },
          { id: 'vendorContactNumber', label: 'Vendor Contact Number' },

          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 70,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleViewClick={() => {
                    setSelectedRow(row as IResourceVendorFormValues);
                    onClick(row as IResourceVendorFormValues, 'view');
                  }}
                  handleDeleteClick={() => {
                    setSelectedRow(row as IResourceVendorFormValues);
                    onClick(row as IResourceVendorFormValues, 'delete');
                  }}
                  handleEditClick={() => {
                    setSelectedRow(row as IResourceVendorFormValues);
                    onClick(row as IResourceVendorFormValues, 'edit');
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {/* {addResourceLossDamagedDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Add Report Loss/Damage"
          open={addResourceLossDamagedDialog.value}
          handleClose={addResourceLossDamagedDialog.onFalse}
        >
          <AddReportLossDialog
            onClose={() => {
              addResourceLossDamagedDialog.onFalse();
            }}
            data={{} as IResourceIncidentFormValues}
            isEdit={false}
          />
        </CustomDialog>
      )} */}
    </>
  );
};

export default ResourceVendorTable;
