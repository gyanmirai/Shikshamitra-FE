import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Box, Button, Slider, TextField, Typography, DialogActions } from '@mui/material';

interface AddNewBounceCheckChargesDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

const AddNewBounceCheckChargesDialog: React.FC<AddNewBounceCheckChargesDialogProps> = ({
  data,
  allData,
  onClose,
  onSave,
  isEdit,
  dialogValue,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const [range, setRange] = useState<number[]>([1000, 5000]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setRange(newValue as number[]);
  };

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   const isChanged = !isEqual(formik.values, initialValues);
  //   dispatch(setIsChanges(isChanged));
  // }, [dispatch, formik.values, initialValues]);

  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Bounce Cheque Charges"
          links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Bounce Cheque Charges' }]}
        />
        <Box sx={{ mr: '15px', mb: '20px' }} gap={3} display="flex" justifyContent="flex-end">
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCloseDialog}
            variant="contained"
            size="small"
          >
            Back
          </Button>
        </Box>
      </Box>
      <Box>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* First Row */}
            <Box display="flex" flexDirection="row" gap={2}>
              <CustomSelect
                fullWidth
                label="Bank Name"
                options={[]}
                value=""
                onChange={() => {}}
                sx={{
                  minHeight: 40,
                  '& .MuiOutlinedInput-root': {
                    padding: '7px 14px',
                  },
                }}
              />
              <TextField
                fullWidth
                name="bounceReason"
                label="Bounce Reason"
                value=""
                onChange={() => {}}
                size="small"
              />
            </Box>

            {/* Second Row */}
            <Box display="flex" flexDirection="row" gap={2}>
              <TextField
                fullWidth
                name="charges"
                label="Charges"
                value=""
                onChange={() => {}}
                type="number"
                size="small"
              />
              {/* <TextField
                                    fullWidth
                                    name="gstCharges"
                                    label="GST Charges"
                                    value=""
                                    onChange={() => { }}
                                    type="number"
                                    size="small"
                                /> */}
            </Box>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
              <Typography fontSize="15px">Select Amount Range</Typography>

              <Box width="90%">
                <Slider
                  value={range}
                  onChange={handleChange}
                  valueLabelDisplay="auto"
                  min={500}
                  max={10000}
                  step={100}
                  marks={[
                    { value: 500, label: '500' },
                    { value: 2500, label: '2.5K' },
                    { value: 5000, label: '5K' },
                    { value: 7500, label: '7.5K' },
                    { value: 10000, label: '10K' },
                  ]}
                  sx={{
                    mx: 2, // Add horizontal margin to give some space on the sides
                  }}
                />
              </Box>

              {/* Min and Max Labels */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={-2}>
                <Typography variant="body2">Min: ₹ {range[0]}</Typography>
                <Typography variant="body2">Max: ₹ {range[1]}</Typography>
              </Box>
            </Box>
          </Box>

          <DialogActions>
            <Button type="submit" variant="outlined" size="small">
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </>
  );
};

export default AddNewBounceCheckChargesDialog;
