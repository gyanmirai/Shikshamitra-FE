import type { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';

import { useFormik } from 'formik';

import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const HostelLeaveAbsent = ({
  handleClose,
  status,
  leaveId,
}: {
  handleClose: (e: any, isSubmit: boolean) => void;
  status?: EmployeeLeaveStatusType | null;
  leaveId?: string;
}) => {
  // values: contains form field values
  // handleChange: handles input field changes
  // handleSubmit: handles form submission
  const { values, handleChange, handleSubmit } = useFormik({
    // Set initial form values
    initialValues: {
      remarks: '',
    },
    // Empty submit handler - to be implemented
    async onSubmit() {
      console.log('');
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={3}>
          <TextField
            value={values.remarks}
            onChange={handleChange}
            label="Remarks"
            multiline
            fullWidth
            rows={4}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            handleClose(null, false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={() => {
            // handleClose(null, false);
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
};

export default HostelLeaveAbsent;
