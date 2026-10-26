'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Button,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

const LateArrivalPolicy = () => {
  const leaveRuleDialog = useBoolean();
  const assignEmployeeDialog = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            assignEmployeeDialog.onTrue();
            pop.onClose();
          }}
        >
          {' '}
          <Iconify icon="mdi:arrow-right-bold" />
          Assign Staff
        </MenuItem>
      </MenuList>
    ),
    [assignEmployeeDialog]
  );

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      leaveRuleDialog.onFalse();
      setEditData(null);
    } else if (!isChanges) {
      leaveRuleDialog.onFalse();
      setEditData(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="small"
          onClick={() => {
            leaveRuleDialog.onTrue();
          }}
        >
          Leave Rule
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Leave Rule Found{' '}
            <Box
              component="button"
              type="button"
              onClick={() => {
                leaveRuleDialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                border: 0,
                p: 0,
                bgcolor: 'transparent',
                font: 'inherit',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Leave Rule
            </Box>
          </>
        }
        tableId="late-arrival-policy-table"
        columns={[
          { id: 'policyName', label: 'Policy Name' },
          { id: 'gracePeriod', label: 'Grace Period' },
          { id: 'thresHold', label: 'ThresHold(Day)', filterType: 'number' },
          { id: 'penaltyAmount', label: 'Penalty Amount', filterType: 'number' },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            policyName: 'Standard Late Policy',
            gracePeriod: '10 minutes',
            thresHold: '3 Days',
            penaltyAmount: '$5',
          },
          {
            id: 2,
            policyName: 'Strict Late Policy',
            gracePeriod: '5 minutes',
            thresHold: '2 Days',
            penaltyAmount: '$10',
          },
          {
            id: 3,
            policyName: 'Flexible Late Policy',
            gracePeriod: '15 minutes',
            thresHold: '5 Days',
            penaltyAmount: '$2',
          },
          {
            id: 4,
            policyName: 'Zero Tolerance Policy',
            gracePeriod: '0 minutes',
            thresHold: '1 Day',
            penaltyAmount: '$20',
          },
        ]}
      />
      <CustomDialog
        open={leaveRuleDialog.value}
        handleClose={() => {
          leaveRuleDialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Leave Arrival Policy</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="In this dialog, you can create a late arrival policy by setting rules for how late arrivals are handled, including permissible time, penalties."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <LateArrivalPolicyForm handleClose={handleClose} editData={editData} />
      </CustomDialog>

      <CustomDialog
        open={assignEmployeeDialog.value}
        handleClose={assignEmployeeDialog.onFalse}
        title="Assign Staff"
      >
        <AssignEmployeeForm />
      </CustomDialog>
    </Box>
  );
};

export default LateArrivalPolicy;

const LateArrivalPolicyForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: any | null;
}) => {
  const formik = useFormik({
    initialValues: {
      policyName: editData?.policyName || '',
      gracePeriod: editData?.gracePeriod === null ? '' : editData?.gracePeriod,
      lateArrivalThreshold: editData?.lateArrivalThreshold || '',
      penaltyAmount: editData?.penaltyAmount || '',
    },
    onSubmit: async (values) => {
      try {
        // if (editData) {
        //     return ;
        // } else {

        // }
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={() => {}}>
          <Scrollbar sx={{ p: 2, height: '200px', bgcolor: 'background.neutral' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  size="small"
                  name="policyName"
                  onChange={formik.handleChange}
                  label="Policy Name"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TimePicker
                  label="Grace Period (Min)"
                  name="gracePeriod"
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{ minWidth: '180px', width: '100%' }}
                  onChange={(val) => {
                    formik.setFieldValue('gracePeriod', val);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="lateArrivalThreshold"
                  size="small"
                  onChange={formik.handleChange}
                  label="Late Arrival Threshold(Days)"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="penaltyAmount"
                  onChange={formik.handleChange}
                  label="Penalty Amount"
                  size="small"
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button variant="outlined" size="small" onClick={handleClose}>
              Cancel
            </Button>
            <LoadingButton
              // loading={isLoading || isUpdateLoading}
              type="submit"
              variant="contained"
              size="small"
            >
              Save
            </LoadingButton>
          </DialogActions>
        </form>
      </BackPopUpChecked>
    </Box>
  );
};

const AssignEmployeeForm = () => (
  <Box display="flex" flexDirection="column" gap={1}>
    <form onSubmit={() => {}}>
      <Scrollbar sx={{ p: 2, height: '150px', bgcolor: 'background.neutral' }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Autocomplete
              options={[
                { id: 1, organization: 'All' },
                { id: 2, organization: 'Pre-Primary' },
                { id: 3, organization: 'Primary' },
                { id: 4, organization: 'Secondary' },
              ]}
              multiple
              getOptionLabel={(option) => option.organization}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<Iconify icon="mdi:checkbox-blank-outline" />}
                    checkedIcon={<Iconify icon="mdi:checkbox-marked" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.organization}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Organizations"
                  placeholder="Search Organizations"
                  size="small"
                  fullWidth
                  sx={{ width: '100%', minWidth: '200px' }}
                />
              )}
              onChange={(e, value) => {}}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              options={[
                { id: 1, employee: 'All' },
                { id: 2, employee: 'ABC' },
                { id: 3, employee: 'XYZ' },
                { id: 4, employee: 'PQR' },
              ]}
              multiple
              getOptionLabel={(option) => option.employee}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<Iconify icon="mdi:checkbox-blank-outline" />}
                    checkedIcon={<Iconify icon="mdi:checkbox-marked" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.employee}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Staff"
                  placeholder="Search Staff"
                  size="small"
                  fullWidth
                  sx={{ width: '100%', minWidth: '200px' }}
                />
              )}
              onChange={(e, value) => {}}
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={() => {}}>
          Cancel
        </Button>
        <LoadingButton
          // loading={isLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
        >
          Save
        </LoadingButton>
      </DialogActions>
    </form>
  </Box>
);
