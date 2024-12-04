import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Radio,
  Button,
  FormLabel,
  TextField,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { Upload } from 'src/components/upload';

const UploadContent = () => (
  <Box>
    <Box display="flex" gap={2} mb={1}>
      <TextField label="Resource Title" size="small" />
      <TextField label="Description" size="small" multiline rows={3} />
      <DatePicker
        label="Date"
        name="date"
        value={null}
        onChange={(date) => {}}
        format="DD-MM-YYYY"
        slotProps={{ textField: { size: 'small' } }}
      />
      {/* <CustomSelect options={[]} label="subject" value="" onChange={() => {}} />
      <CustomSelect options={[]} label="Grade" value="" onChange={() => {}} /> */}
      <FormControl component="fieldset">
        <FormLabel component="legend">Select Media Type</FormLabel>
        <RadioGroup aria-label="media-type" name="media-type" row>
          <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
          <FormControlLabel value="video" control={<Radio />} label="Video" />
          <FormControlLabel value="image" control={<Radio />} label="Image" />
        </RadioGroup>
      </FormControl>
    </Box>

    <Upload />
    <Button variant="contained">Submit</Button>
  </Box>
);

export default UploadContent;
