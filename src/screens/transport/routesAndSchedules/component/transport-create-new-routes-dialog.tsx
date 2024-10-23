import React, { useState } from 'react';

import { Box, Button, Slider, TextField, Typography, DialogActions } from '@mui/material';

import CustomDialog from 'src/components/customDialog';
import { ComponentBlock } from 'src/components/component-block';

interface TransportCreateNewRoutesDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

const TransportCreateNewRoutesDialog: React.FC<TransportCreateNewRoutesDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  const [sliderData, setSliderData] = useState([
    { label: 'Software License', value: 8000 },
    { label: 'Hardware Purchase', value: 3000 },
    { label: 'Consulting Services', value: 5000 },
  ]);

  const handleSliderChange = (index: number) => (event: Event, newValue: number) => {
    const newSliderData = [...sliderData];
    newSliderData[index].value = newValue; // Update the specific slider value
    setSliderData(newSliderData);
  };

  return (
    <CustomDialog title="Enter Route Details" open={dialogValue} handleClose={onClose}>
      <Box py="15px" px="15px" display="flex" flexDirection="column" gap={2}>
        <Box display="flex" flexDirection="row" gap={2}>
          <TextField
            name="department"
            label="Department"
            value=""
            onChange={() => {}}
            size="small"
          />
          <TextField
            name="allocatedAmount"
            label="Allocated Amount"
            value=""
            onChange={() => {}}
            size="small"
          />
        </Box>

        {sliderData.map((item, index) => (
          <>
            <ComponentBlock key={index} sx={{ px: '30px', py: '5px' }}>
              <Slider
                value={item.value}
                // @ts-ignore
                onChange={handleSliderChange(index)}
                aria-labelledby={`continuous-slider-${index}`}
              />
            </ComponentBlock>
            <Box display="flex" justifyContent="flex-end" alignItems="flex-end" pr="15px">
              <Typography
                variant="caption" // Smaller font size
                sx={{ textAlign: 'right' }} // Align to right and add margin on top
              >
                {item.label} - {item.value}
              </Typography>
            </Box>
          </>
        ))}

        <DialogActions>
          <Button onClick={onClose} variant="contained" size="small">
            Cancel
          </Button>
          <Button onClick={() => onSave(sliderData)} variant="contained" size="small">
            Submit Adjustments
          </Button>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
};

export default TransportCreateNewRoutesDialog;
