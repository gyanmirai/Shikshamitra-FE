'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import RuleForm from './components/RuleForm';
import HostelRule from './components/hostelRule';

const HostelSetting = () => {
  // Dialog state for viewing hostel rule details
  const viewDetailsDialog = useBoolean();
  const addRuleDialog = useBoolean();
  // useDispatch hook to dispatch actions
  const dispatch = useDispatch();
  // useSelector hook to access the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addRuleDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addRuleDialog.onFalse();
    }
  };
  return (
    <Box display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Setting"
        description="Hostel Rules Setting"
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Setting', href: '' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" startIcon={<Iconify icon={GlobalIcons.download} />}>
          Download Sample Rule
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            addRuleDialog.onTrue();
          }}
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
        >
          Upload Rule File
        </Button>
      </Box>
      <CustomizableTable
        tableId="hostel-rules-table"
        searchFieldProps={{
          placeholder: 'Search Hostel Rule...',
          label: 'Search Hostel Rule...',
        }}
        noDataText="Hostel Rules Data Not Available"
        columns={[
          { id: 'ruleName', label: 'Hostel Rule Name' },
          { id: 'desciption', label: 'Description' },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 40,
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showViewIcon
                  handleViewClick={() => {
                    viewDetailsDialog.onTrue();
                  }}
                  showThreeDots={false}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            ruleName: 'No Smoking',
            description: 'Smoking is prohibited in all areas of the hostel.',
          },
          {
            ruleName: 'Quiet Hours',
            description: 'Quiet hours are from 10 PM to 7 AM every day.',
          },
          {
            ruleName: 'Guests',
            description: 'No overnight guests allowed in the hostel premises.',
          },
          {
            ruleName: 'Curfew',
            description:
              'Students must return to the hostel by 9 PM on weekdays and 11 PM on weekends.',
          },
          {
            ruleName: 'Food in Rooms',
            description:
              'No food allowed inside the rooms. All meals must be taken in the dining hall.',
          },
        ]}
      />
      <CustomDialog open={viewDetailsDialog.value} handleClose={viewDetailsDialog.onFalse} title="">
        <HostelRule />
      </CustomDialog>
      <CustomDialog
        open={addRuleDialog.value}
        handleClose={addRuleDialog.onFalse}
        title="Create Hostel Rule"
      >
        <RuleForm
          open={addRuleDialog}
          onClose={() => {
            handleClose(null, false);
          }}
        />
      </CustomDialog>{' '}
    </Box>
  );
};

export default HostelSetting;
