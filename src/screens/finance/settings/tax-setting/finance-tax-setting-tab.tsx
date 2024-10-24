import React, { useState, useEffect } from 'react';

import { Box, Button, Tooltip, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Add New Tax
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Tax Settings Overview
        </Typography>
      </Box>
      <CustomizableTable
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
                    fontSize={14}
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
                  fontSize={14}
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
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setSelectedEntry(row);
                          setIsEdit(true);
                          dialog.onTrue();
                          //   popover.onClose();
                        }}
                      >
                        <Iconify color="blue" icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDelete(row);
                        }}
                      >
                        <Iconify color="red" icon="solar:trash-bin-trash-bold" />
                        Delete
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={tableData}
      />
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
