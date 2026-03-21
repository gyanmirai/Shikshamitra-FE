import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { RegistrationStatusType } from 'src/enums/registration-status-type';
import { Box, Stack, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useChangeAdmissionStatusMutation } from 'src/redux/student/admission/admission-api';

interface StatusOption {
  label: string;
  value: number;
  description: string;
}

const ChangeStudentStatusForm = ({
  handleClose,
  studentId,
  status,
  studentName,
}: {
  handleClose: () => void;
  studentId: string;
  status: RegistrationStatusType;
  studentName: string;
}) => {
  const options: StatusOption[] = [
    {
      label: 'Active',
      value: RegistrationStatusType.Active,
      description: 'The student is currently enrolled and actively attending classes.',
    },
    {
      label: 'Inactive',
      value: RegistrationStatusType.Inactive,
      description: 'The student is temporarily not attending but remains enrolled.',
    },
    {
      label: 'Left',
      value: RegistrationStatusType.Left,
      description: 'The student has permanently left the institution.',
    },
  ];

  const [updateStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeAdmissionStatusMutation,
  });

  const formik = useFormik<{
    status: StatusOption | undefined;
    remarks: string;
  }>({
    initialValues: {
      status: options.find((opt) => opt.value === status) || undefined,
      remarks: '',
    },
    onSubmit: async (values) => {
      if (!values.status) return;
      try {
        await updateStatus({
          body: [
            {
              id: studentId,
              status: values.status.value,
              remarks: values.remarks,
            },
          ],
        }).unwrap();
        shikshaMitraToast.success({
          message: `Status of ${studentName} has been updated successfully.`,
        });
        handleClose();
      } catch (error) {
        console.error(error);
        shikshaMitraToast.error({ message: 'Failed to update status.' });
      }
    },
  });

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Autocomplete
            options={options}
            value={formik.values.status}
            onChange={(_, newValue) => {
              formik.setFieldValue('status', newValue || 0);
            }}
            size="small"
            disableClearable
            getOptionLabel={(option) => String(option.label)}
            renderInput={(params) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField {...params} size="small" label="Select Status" fullWidth />
              </Box>
            )}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
              >
                {option.label}
                <Box sx={{ marginLeft: 'auto' }}>
                  <CustomTooltip
                    arrow
                    placement="right"
                    sx={{ textAlign: 'justify' }}
                    title={option.description}
                  >
                    <Iconify
                      icon="lucide:info"
                      sx={{ cursor: 'pointer' }}
                      color={
                        option.value === RegistrationStatusType.Active
                          ? 'info.main'
                          : option.value === RegistrationStatusType.Inactive
                            ? 'info.main'
                            : option.value === RegistrationStatusType.Left
                              ? 'info.main'
                              : 'grey.500'
                      }
                    />
                  </CustomTooltip>
                </Box>
              </Box>
            )}
          />
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formik.values.remarks}
            onChange={formik.handleChange}
            multiline
            rows={4}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={handleClose}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.edit} width={16} height={16} />}
          loading={isLoading}
          variant="contained"
          type="submit"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </>
  );
};

export default ChangeStudentStatusForm;
