import React from 'react';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import type { IAddNewMemberDialogProps } from '../member-dialog-interface';

const AddNewMemberDialog: React.FC<IAddNewMemberDialogProps> = ({
  isRenewMembership,
  isEdit,
  dialogValue,
  onSave,
  onClose,
  data,
}) => {
  const formik = useFormik<any>({
    initialValues: {
      bookTitle: '',
      bookAuthor: '',
      isbn: '',
      tags: '',
      quantity: '',
      category: '',
      condition: '',
    },
    onSubmit: (values: any) => {
      onSave(values);
    },
  });

  return (
    <CustomDialog title="Make Reservation" open={dialogValue} handleClose={onClose} maxWidth="sm">
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
            {isEdit ||
              (isRenewMembership && (
                <Box display="flex" justifyContent="flex-end">
                  <Label
                    variant="soft"
                    color={
                      data !== null
                        ? data.memberStatus === 'Active'
                          ? 'success'
                          : 'error'
                        : 'info'
                    }
                  >
                    {data !== null ? data.memberStatus : ''}
                  </Label>
                </Box>
              ))}
            <Grid container spacing={3} pt="10px">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="name"
                  label="Book Id"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="name"
                  label="Book Title"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Year"
                  options={[]}
                  value={formik.values.Role}
                  onChange={(value) => formik.setFieldValue('role', value)}
                  formControlProps={{ sx: { minWidth: 270 } }}
                  disabled={isEdit}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Member"
                  options={[]}
                  value={formik.values.Role}
                  onChange={(value) => formik.setFieldValue('role', value)}
                  formControlProps={{ sx: { minWidth: 270 } }}
                  disabled={isEdit}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Requested Date"
                  value={formik.values.issueDate}
                  onChange={(value) => {
                    // formik.setFieldValue('issueDate', value);
                    // const role = memberData.find((member) => member.id === formik.values.memberID)?.role;
                    // const dueDate = calculateDueDate(value, role);
                    // formik.setFieldValue('dueDate', dueDate);
                  }}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              {/* <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    name="borrowingLimit"
                                    label="Borrowing Limit"
                                    value={formik.values.borrowingLimit}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid> */}
              {isRenewMembership && data !== null && data.memberStatus === 'Expired' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    label="Renewal Duration"
                    options={[]}
                    value={formik.values.renewalDuration}
                    onChange={(value) => formik.setFieldValue('renewalDuration', value)}
                    formControlProps={{ sx: { minWidth: 270 } }}
                    disabled={isEdit}
                  />
                </Grid>
              )}
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.reservation} />}
              type="submit"
              variant="contained"
              size="small"
            >
              Make Reservation
            </Button>
            {/* {isRenewMembership && data !== null && data.memberStatus === "Expired" && <Button type="submit" variant="contained" size="small">
                            Renew Membership
                        </Button>}
                        {!isEdit && !isRenewMembership && <Button type="submit" variant="contained" size="small">
                            Add New Member
                        </Button>

                        }
                        {isEdit && <Button type="submit" variant="contained" size="small">
                            Save
                        </Button>

                        } */}
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default AddNewMemberDialog;
