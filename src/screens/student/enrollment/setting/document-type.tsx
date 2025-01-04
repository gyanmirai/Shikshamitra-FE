import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Add, RemoveCircle } from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  TextField,
  IconButton,
  Autocomplete,
  DialogActions,
  createFilterOptions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const DocumentType = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Add New document
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'document', label: 'Documents' },
          {
            id: 'type',
            label: 'Type',
            render(value, row) {
              return row.type.join(', ');
            },
          },
          {
            id: 'delete',
            label: 'Remove',
            isSort: false,
            render(value, row) {
              return (
                <IconButton color="error">
                  {' '}
                  <RemoveCircle />
                </IconButton>
              );
            },
          },
        ]}
        data={[
          { document: 'Certificate_BonafiedTabular.pdf', type: ['image', 'pdf'] },
          { document: 'Certificate_Bonafied_Double.pdf', type: ['image', 'pdf'] },
          { document: 'Certificate_Bonafied_LetterHead.pdf', type: ['image'] },
          { document: 'Certificate_Bonafied_WithAddress.pdf', type: ['image'] },
          { document: 'Certificate_Bonafied_WithPreviousDetai', type: ['image', 'pdf'] },
          { document: 'Certificate_CBSETransfer.pdf', type: ['image'] },
          { document: 'Certificate_Transfer_CBSE.pdf', type: ['image'] },
          { document: 'First Trial Certificates.pdf', type: ['image'] },
        ]}
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add Document">
        <DocumentForm handleClose={dialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};

export default DocumentType;

const filter = createFilterOptions<{ title: string; inputValue?: string }>();

const DocumentForm = ({ handleClose }: { handleClose?: () => void }) => {
  const { values, setFieldValue, handleSubmit } = useFormik<{
    document: { title: string; inputValue?: string };
    documentType: string[];
  }>({
    initialValues: {
      document: { title: '' },
      documentType: [],
    },
    validationSchema: Yup.object({
      documentType: Yup.string().required('Document type is required'),
    }),
    onSubmit: (formikValues) => {
      console.log(formikValues);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <Autocomplete
            value={values.document}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setFieldValue('document', {
                  title: newValue,
                });
              } else if (newValue && newValue.inputValue) {
                // Create a new value from the user input
                setFieldValue('document', {
                  title: newValue.inputValue,
                });
              } else {
                setFieldValue('document', newValue);
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              const { inputValue } = params;
              // Suggest the creation of a new value
              const isExisting = options.some((option) => inputValue === option.title);
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  title: `Add "${inputValue}"`,
                });
              }

              return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={[
              { title: 'Certificate_BonafiedTabular.pdf' },
              { title: 'Certificate_Bonafied_Double.pdf' },
              { title: 'Certificate_Bonafied_LetterHead.pdf' },
              { title: 'Certificate_Bonafied_WithAddress.pdf' },
              { title: 'Certificate_Bonafied_WithPreviousDetai' },
              { title: 'Certificate_CBSETransfer.pdf' },
              { title: 'Certificate_Transfer_CBSE.pdf' },
              { title: 'First Trial Certificates.pdf' },
            ]}
            getOptionLabel={(option) => {
              // Value selected with enter, right from the input
              if (typeof option === 'string') {
                return option;
              }
              // Add "xxx" option created dynamically
              if (option.inputValue) {
                return option.inputValue;
              }
              // Regular option
              return option.title;
            }}
            renderOption={(props, option) => <li {...props}>{option.title}</li>}
            freeSolo
            fullWidth
            renderInput={(params) => (
              <TextField {...params} fullWidth size="small" label="search and add document" />
            )}
          />

          <CustomSelect
            options={[
              { label: 'Image', value: 'image' },
              { label: 'Pdf', value: 'pdf' },
              { label: 'Doc', value: 'doc' },
              { label: 'Docx', value: 'docx' },
              { label: 'Xlsx', value: 'xlsx' },
            ]}
            value={values.documentType}
            multiple
            label="Select document Type"
            onChange={(value) => setFieldValue('documentType', value)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </DialogActions>
    </form>
  );
};
