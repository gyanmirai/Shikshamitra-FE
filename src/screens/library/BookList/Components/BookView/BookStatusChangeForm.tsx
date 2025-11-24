import type { IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { LibraryBookStatus } from 'src/enums/library-book-status';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

interface ChangeStatusFormProps {
  editData: IBookCopyWithBook | null;
  onClose: (e: any, isSubmit: boolean) => void;
}
const allowedStatuses = [
  LibraryBookStatus.Removed,
  LibraryBookStatus.UnderMaintenance,
  LibraryBookStatus.Lost,
];

const ChangeBookStatusForm: React.FC<ChangeStatusFormProps> = ({ editData, onClose }) => {
  if (!editData) return null; // handle null data

  const options = allowedStatuses.map((status) => ({
    label: LibraryBookStatus[status],
    value: status,
    description:
      status === LibraryBookStatus.Removed
        ? 'Book has been removed from the library'
        : status === LibraryBookStatus.UnderMaintenance
          ? 'Book is currently under maintenance'
          : 'Book has been reported as lost',
  }));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formik = useFormik({
    initialValues: {
      status: editData.status || 0,
      remarks: '',
    },
    onSubmit: async (values) => {
      shikshaMitraToast.success({
        message: `Status has been updated successfully.`,
      });
      onClose(null, true); // indicate submit
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={options}
              value={options.find((o) => o.value === formik.values.status) ?? undefined}
              onChange={(_, newValue) => formik.setFieldValue('status', newValue?.value)}
              size="small"
              disableClearable
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box
                    component="li"
                    key={key}
                    {...otherProps}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
                  >
                    {option.label}
                    <Box sx={{ marginLeft: 'auto' }}>
                      <CustomTooltip title={option.description} placement="right">
                        <Iconify icon="mdi:information" width={20} color="gray" />
                      </CustomTooltip>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Status" fullWidth size="small" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Remarks"
              name="remarks"
              value={formik.values.remarks}
              onChange={formik.handleChange}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => onClose(null, false)}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={16} height={16} />}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeBookStatusForm;
