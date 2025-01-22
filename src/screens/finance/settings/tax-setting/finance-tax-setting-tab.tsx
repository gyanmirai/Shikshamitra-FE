'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

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
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(data);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(data);
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState([]);
  const dialogForDeleteConfirmation = useBoolean();
  // const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const handleViewCategories = (region: any) => {
    setSelectedRegion(region);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  useEffect(() => {}, [selectedEntry, isEdit, tableData]);

  const handleDelete = (item: any) => {
    data = data.filter((val) => val.id !== item.id || val.id !== item.id);

    setTableData([...data]);
  };

  const handleSave = (dataFromDialog: any) => {
    const { id, taxName, taxPercentage, applicableRegion, applicableCategory } = dataFromDialog;

    if (dataFromDialog) {
      const existingEntryIndex = data.findIndex((val) => id === val.id);

      if (existingEntryIndex !== -1 && !isEdit) {
        // setShowDuplicateDialog(true)
        closeDialog();
        return;
      }

      // Prepare the new entry
      const taxSetting = {
        id,
        taxName,
        taxPercentage,
        applicableRegion: applicableRegion || [], // Ensure it's an array
        applicableCategory: applicableCategory || [], // Ensure it's an array
        action: 'View',
      };

      // Check for duplicate regions and categories
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

  return (
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

        <Button onClick={dialog.onTrue} variant="contained" size="small">
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
                    style={{ cursor: region.length > 1 ? 'pointer' : 'default', color: 'black' }}
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
                  style={{ cursor: categories.length > 1 ? 'pointer' : 'default', color: 'black' }}
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
                    dialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={tableData}
      />

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          onConfirm={() => {}}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
        />
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
    </>
  );
};

export default FinanceTaxSettingTab;
