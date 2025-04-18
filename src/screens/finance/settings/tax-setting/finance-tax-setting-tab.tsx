'use client';

import React, { useState, useEffect } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import FinanceTaxSettingDialog from './component/finance-tax-setting-dialog';

interface Data {
  taxName: string;
  taxPercentage: string;
  applicableRegion: string[];
  applicableCategory: string[];
  id: number;
  action?: string;
}

let data: Data[] = [
  {
    id: 1,
    taxName: 'GST',
    taxPercentage: '33%',
    applicableRegion: ['India', 'Nepal'],
    applicableCategory: ['Tuition Fee', 'Sports Fee'],
    action: 'View',
  },
  {
    id: 2,
    taxName: 'GST',
    taxPercentage: '33%',
    applicableRegion: ['India', 'Nepal', 'Bhutan', 'Usa'],
    applicableCategory: ['Tuition Fee', 'Sports Fee'],
    action: 'View',
  },
];
const FinanceTaxSettingTab = () => {
  // State management for dialog visibility
  const dialog = useBoolean();
  // State to store selected entry data
  const [selectedEntry, setSelectedEntry] = useState(data);
  // State to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);
  // State to store table data
  const [tableData, setTableData] = useState(data);
  // State to control dialog open/close
  const [open, setOpen] = useState(false);
  // State to store selected region data
  const [selectedRegion, setSelectedRegion] = useState([]);
  // State for delete confirmation dialog
  const dialogForDeleteConfirmation = useBoolean();
  // State for duplicate entry dialog (currently disabled)
  // const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  // Handler to view categories for a specific region
  const handleViewCategories = (region: any) => {
    setSelectedRegion(region);
    setOpen(true);
  };

  // Handler to close the main dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Handler to close dialog and reset edit mode
  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  // Effect to monitor changes in selected entry, edit mode, and table data
  useEffect(() => {}, [selectedEntry, isEdit, tableData]);

  // Handler to delete a tax entry
  const handleDelete = (item: any) => {
    data = data.filter((val) => val.id !== item.id || val.id !== item.id);
    setTableData([...data]);
  };

  // Handler to save new or updated tax settings
  const handleSave = (dataFromDialog: any) => {
    const { id, taxName, taxPercentage, applicableRegion, applicableCategory } = dataFromDialog;

    if (dataFromDialog) {
      // Check if entry with same ID exists
      const existingEntryIndex = data.findIndex((val) => id === val.id);

      // Prevent duplicate entries when not in edit mode
      if (existingEntryIndex !== -1 && !isEdit) {
        // setShowDuplicateDialog(true)
        closeDialog();
        return;
      }

      // Create new tax setting object
      const taxSetting = {
        id,
        taxName,
        taxPercentage,
        applicableRegion: applicableRegion || [], // Default to empty array if undefined
        applicableCategory: applicableCategory || [], // Default to empty array if undefined
        action: 'View',
      };

      // Update existing entry or add new entry
      if (existingEntryIndex !== -1 && isEdit) {
        const existingEntry = data[existingEntryIndex];
        existingEntry.applicableRegion = applicableRegion;
        existingEntry.applicableCategory = applicableCategory;
      } else if (existingEntryIndex === -1 && !isEdit) {
        data.push(taxSetting);
      }
    }

    closeDialog();
    console.log(dataFromDialog);
  };

  // Handler to close dialog and reset edit mode
  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };
  return (
    <Box height="100%">
      {open ? (
        <FinanceTaxSettingDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeHandler}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            pb="20px"
          >
            <CustomBreadcrumbs
              heading="Tax Settings"
              links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Tax Settings' }]}
              sx={{ px: 1, mb: 2 }}
            />

            <Button
              onClick={() => {
                setOpen(true);
              }}
              variant="contained"
              size="small"
            >
              Add New Tax
            </Button>
          </Box>

          <CustomizableTable
            tableId="finance-tax-setting-table"
            columns={[
              { id: 'taxName', label: 'Tax Name' },
              { id: 'taxPercentage', label: 'Tax Percentage' },
              {
                id: 'applicableRegion',
                label: 'Applicable Region',
                render(value, row: any) {
                  const region = row.applicableRegion;
                  const displayText = region.length > 1 ? `${region[0]} and Others` : region[0];

                  return (
                    <Tooltip
                      title={
                        region.length > 1 ? (
                          <div>
                            {region.map((val: any, index: any) => (
                              <Typography key={index}>{val}</Typography>
                            ))}
                          </div>
                        ) : (
                          ''
                        )
                      }
                      arrow
                    >
                      <Typography
                        component="span"
                        fontSize={12}
                        style={{
                          cursor: region.length > 1 ? 'pointer' : 'default',
                          color: 'black',
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {displayText}
                      </Typography>
                    </Tooltip>
                  );
                },
              },

              {
                id: 'applicableCategory',
                label: 'Applicable Category',
                render(value, row: any) {
                  const categories = row.applicableCategory;
                  const displayText =
                    categories.length > 1 ? `${categories[0]} and others` : categories[0];

                  return (
                    <Typography
                      component="span"
                      fontSize={12}
                      style={{
                        cursor: categories.length > 1 ? 'pointer' : 'default',
                        color: 'black',
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {displayText}
                    </Typography>
                  );
                },
              },
              {
                id: 'action',
                label: 'Action',
                render(value, row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        dialogForDeleteConfirmation.onTrue();
                        handleDelete(row);
                      }}
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row);
                        setIsEdit(true);
                        setOpen(true);
                        // dialog.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={tableData}
          />
        </>
      )}

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Delete
            </LoadingButton>
          }
        />
        // <DeleteConfirmationDialog
        //   open={dialogForDeleteConfirmation.value}
        //   onClose={() => {
        //     dialogForDeleteConfirmation.onFalse();
        //   }}
        //   onConfirm={() => {}}
        //   title="Delete Item"
        //   description="Are you sure you want to delete this item? This action cannot be undone."
        // />
      )}
      <Box>
        {dialog.value && selectedEntry && (
          <FinanceTaxSettingDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            allData={tableData}
          />
        )}
      </Box>
    </Box>
  );
};

export default FinanceTaxSettingTab;
