'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Label, type LabelColor } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  AuditStatusType,
  AuditStatusTypeColor,
  AuditStatusTypeOptions,
} from 'src/enums/audit-status-type';
import {
  Box,
  Grid,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import ResourceVerifiedAllocateDialog from './component/aknowledge-dialog';

/**
 * AuditVerificationScreen Component
 * Renders the main audit and verification management interface
 * Includes a table of audits, actions, and a form dialog for creating new audits
 */
const AuditVerificationScreen = () => {
  /**
   * Boolean state hook to control the visibility of the audit form dialog
   */
  const isOpenForm = useBoolean();
  const isAuditVerifacationDialog = useBoolean();

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Audit & Verification"
        links={[
          { name: 'Resource Management', href: '/resourceManagement/dashboard' },
          { name: 'Audit & Verification' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={isOpenForm.onTrue}>
            New Audit
          </Button>
        }
      />
      <CustomizableTable
        tableId="audit-verification-table"
        searchFieldProps={{
          placeholder: 'Search by Audit ID, Name, or Date',
          label: 'Search by Audit ID, Name, or Date',
          sx: {
            maxWidth: 300,
            width: '100%',
          },
        }}
        noDataText={
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            No Audit Found
          </Box>
        }
        columns={[
          {
            label: 'Asset Name',
            id: 'assetName',
          },
          {
            label: 'Assign Staff',
            id: 'assignStaff',
          },
          {
            label: 'last Verification',
            id: 'lastVerification',
            filterType: 'date',
          },
          {
            label: 'Status',
            id: 'status',
            filterType: 'enum',
            enumOptions: AuditStatusTypeOptions,
            render(value, row) {
              const statusValue = AuditStatusType[value] as keyof typeof AuditStatusType;
              const color = AuditStatusTypeColor[statusValue] as LabelColor;
              return <Label color={color as LabelColor}>{statusValue}</Label>;
            },
          },
          {
            label: 'Action',
            id: 'action',
            isFilter: false,
            isSort: false,
            sticky: true,
            minWidth: 100,
            render: () => (
              <ThreeDotsActions
                placement="right-top"
                showEditIcon
                handleEditClick={() => {
                  isOpenForm.onTrue();
                }}
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        isAuditVerifacationDialog.onTrue();
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="iconoir:verified-user" />
                      Mark as verified
                    </MenuItem>

                    <MenuItem onClick={() => {}}>
                      <Iconify icon="carbon:reminder" />
                      Send Reminder
                    </MenuItem>
                    {/* <MenuItem onClick={() => {}}>
                      <Iconify icon="material-symbols-light:order-approve-outline-sharp" />
                    
                    </MenuItem> */}
                    {/* <MenuItem sx={{ color: 'error.main' }} onClick={() => {}}>
                      <Iconify icon="line-md:file-document-cancel" />
                      Reject Dispute
                    </MenuItem> */}
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={[
          {
            assetName: 'Laptop Dell XPS 15',
            assignStaff: 'John Smith',
            lastVerification: '2023-10-15',
            status: 0,
          },
          {
            assetName: 'HP Printer MX450',
            assignStaff: 'Sarah Johnson',
            lastVerification: '2023-10-10',
            status: 1,
          },
          {
            assetName: 'Office Chair Model A',
            assignStaff: 'Mike Brown',
            lastVerification: '2023-10-05',
            status: 0,
          },
          {
            assetName: 'Meeting Room Projector',
            assignStaff: 'Emily Davis',
            lastVerification: '2023-09-30',
            status: 1,
          },
          {
            assetName: 'Network Switch Cisco',
            assignStaff: 'Tom Wilson',
            lastVerification: '2023-09-25',
            status: 2,
          },
        ]}
      />
      <CustomDialog
        maxWidth="md"
        title="New Audit"
        open={isOpenForm.value}
        handleClose={isOpenForm.onFalse}
      >
        <AuditForm handleClose={isOpenForm.onFalse} />
      </CustomDialog>
      <CustomDialog
        maxWidth="md"
        title="Audit Verified For HP Printer MX450"
        open={isAuditVerifacationDialog.value}
        handleClose={isAuditVerifacationDialog.onFalse}
      >
        <ResourceVerifiedAllocateDialog
          onClose={() => {
            isAuditVerifacationDialog.onFalse();
          }}
          data={{}}
        />
      </CustomDialog>
    </Box>
  );
};

export default AuditVerificationScreen;

/**
 * Form component for creating a new audit
 * @param {Object} props - Component props
 * @param {Function} props.handleClose - Function to handle dialog close
 */
const AuditForm = ({ handleClose }: { handleClose: () => void }) => {
  /**
   * Formik instance for form handling
   * Manages form state, validation, and submission
   */
  const formik = useFormik({
    initialValues: {
      assets: [],
      assignStaffs: [],
      startDate: null,
      dueDate: null,
    },
    validationSchema: Yup.object().shape({
      assets: Yup.array().min(1, 'At least one asset is required'),
      assignStaffs: Yup.array().min(1, 'At least one assign staff is required'),
      startDate: Yup.string().required('Start date is required'),
      dueDate: Yup.string().required('Due date is required'),
    }),
    onSubmit: (values) => {
      console.log(values);
      handleClose();
    },
  });

  return (
    <Box onSubmit={formik.handleSubmit} component="form">
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid size={12} pb="10px">
            <ShakingTextField error={!!formik.errors.assets && !!formik.touched.assets}>
              <Autocomplete
                multiple
                size="small"
                id="assets"
                options={[
                  'HP Printer MX450',
                  'Office Chair Model A',
                  'Meeting Room Projector',
                  'Network Switch Cisco',
                ]}
                value={formik.values.assets}
                onChange={(event, newValue) => {
                  formik.setFieldValue('assets', newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Assets *"
                    placeholder="Search assets *"
                    error={!!formik.errors.assets && !!formik.touched.assets}
                    helperText={
                      formik.touched.assets && formik.errors.assets ? formik.errors.assets : ''
                    }
                  />
                )}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={12} pb="10px">
            <ShakingTextField error={!!formik.errors.assignStaffs && !!formik.touched.assignStaffs}>
              <Autocomplete
                multiple
                size="small"
                id="assignStaffs"
                options={['Sarah Johnson', 'Mike Brown', 'Emily Davis', 'Tom Wilson']}
                value={formik.values.assignStaffs}
                onChange={(event, newValue) => {
                  formik.setFieldValue('assignStaffs', newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign Staff *"
                    placeholder="Search staff *"
                    error={!!formik.errors.assignStaffs && !!formik.touched.assignStaffs}
                    helperText={
                      formik.touched.assignStaffs && formik.errors.assignStaffs
                        ? formik.errors.assignStaffs
                        : ''
                    }
                  />
                )}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={12} pb="10px">
            <ShakingTextField error={!!formik.errors.startDate && !!formik.touched.startDate}>
              <DatePicker
                label="Start Date*"
                value={formik.values.startDate}
                onChange={(newValue) => {
                  formik.setFieldValue('startDate', newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!formik.errors.startDate && !!formik.touched.startDate,
                    helperText:
                      formik.touched.startDate && formik.errors.startDate
                        ? formik.errors.startDate
                        : '',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={12} pb="10px">
            <ShakingTextField error={!!formik.errors.dueDate && !!formik.touched.dueDate}>
              <DatePicker
                label="Due Date *"
                value={formik.values.dueDate}
                onChange={(newValue) => {
                  formik.setFieldValue('dueDate', newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!formik.errors.dueDate && !!formik.touched.dueDate,
                    helperText:
                      formik.touched.dueDate && formik.errors.dueDate ? formik.errors.dueDate : '',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          Create Audit
        </Button>
      </DialogActions>
    </Box>
  );
};
