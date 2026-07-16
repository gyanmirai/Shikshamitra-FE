import React from 'react';
import { Upload } from 'src/components/upload';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
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

const UploadContent = () => {
  const [documents, setDocuments] = React.useState<(File | string)[]>([]);
  const [uploadFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  const handleUpload = async () => {
    const files = documents.filter((file): file is File => file instanceof File);
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('File', file);
          const response = await uploadFile(formData).unwrap();
          return response.data || '';
        })
      );
      setDocuments(uploaded.filter(Boolean));
      shikshaMitraToast.success({ message: 'Resource file uploaded successfully.' });
    } catch (error) {
      console.error('Resource upload failed', error);
      shikshaMitraToast.error({ message: 'Resource upload failed.' });
    }
  };

  return (
    <Box>
      <Box display="flex" gap={1} mb={1}>
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

      <Upload
        value={documents}
        onDrop={(acceptedFiles) => setDocuments((current) => [...current, ...acceptedFiles])}
        onRemove={(file) => setDocuments((current) => current.filter((item) => item !== file))}
        onRemoveAll={() => setDocuments([])}
        onUpload={handleUpload}
      />
      <Button variant="contained" disabled={isUploading}>
        Submit
      </Button>
    </Box>
  );
};

export default UploadContent;
