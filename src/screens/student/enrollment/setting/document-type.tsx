import React, { useState } from 'react';

import { Add, RemoveCircle } from '@mui/icons-material';
import { Box, Button, IconButton, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const DocumentType = () => {
  const [document, setDocument] = useState<string>('');
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
          { document: 'Certificate_BonafiedTabular.pdf' },
          { document: 'Certificate_Bonafied_Double.pdf' },
          { document: 'Certificate_Bonafied_LetterHead.pdf' },
          { document: 'Certificate_Bonafied_WithAddress.pdf' },
          { document: 'Certificate_Bonafied_WithPreviousDetai' },
          { document: 'Certificate_CBSETransfer.pdf' },
          { document: 'Certificate_Transfer_CBSE.pdf' },
          { document: 'First Trial Certificates.pdf' },
        ]}
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add Document">
        <Box p={3}>
          <CustomSelect
            options={[]}
            value={document}
            label="Select document"
            onChange={(val: string | string[]) => {
              setDocument(val as string);
            }}
            formControlProps={{ fullWidth: true }}
          />
        </Box>
        <DialogActions>
          <Button variant="contained">Submit</Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default DocumentType;
