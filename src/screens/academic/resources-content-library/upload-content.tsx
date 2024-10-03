import React from 'react';

import {
  Box,
  Radio,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { Upload } from 'src/components/upload';
import CustomSelect from 'src/components/custom-select';

const UploadContent = () => (
  <Box>
    <Typography>Upload New Content</Typography>
    <Box display="flex" gap={2}>
      <TextField label="Resource Title" size="small" />
      <TextField label="Description" size="small" multiline rows={3} />
      <CustomSelect options={[]} label="subject" value="" onChange={() => {}} />
      <CustomSelect options={[]} label="Grade" value="" onChange={() => {}} />
    </Box>

    <FormControl component="fieldset">
      <FormLabel component="legend">Select Media Type</FormLabel>
      <RadioGroup aria-label="media-type" name="media-type" row>
        <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
        <FormControlLabel value="video" control={<Radio />} label="Video" />
        <FormControlLabel value="image" control={<Radio />} label="Image" />
      </RadioGroup>
    </FormControl>
    <Upload />
  </Box>
);

export default UploadContent;
