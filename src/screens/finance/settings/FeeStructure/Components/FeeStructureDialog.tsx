// AddFeeStructureDialog.tsx
import type { FormikProps } from 'formik';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, TextField, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import { FeeStructureClassStatusType } from 'src/enums/fee-structure-statusType';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IFeeStructure } from '../type';

interface Props {
  formik: FormikProps<IFeeStructure>;
  className: string;
  onClose: (e: any, isSubmit: boolean) => void;
}

const AddFeeStructureDialog: React.FC<Props> = ({ formik, className, onClose }) => {
  const [feeStructureName, setFeeStructureName] = useState('');

  const handleSubmit = () => {
    const updated = [...formik.values.feeStructureClasses[className]];

    updated.push({
      feeStructureName: feeStructureName || `Fee Structure ${updated.length + 1}`,
      status: FeeStructureClassStatusType.Current,
      feeItems: [],
    });

    formik.setFieldValue(`feeStructureClasses.${className}`, updated);
    onClose(null, true);
  };

  return (
    <BackPopUpChecked initialValues={feeStructureName} currentValues={feeStructureName}>
      <DialogScrollContent>
        <TextField
          fullWidth
          size="small"
          label="Fee Structure Name"
          value={feeStructureName}
          onChange={(e) => setFeeStructureName(e.target.value)}
          margin="normal"
        />
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          size="small"
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          variant="contained"
          onClick={handleSubmit}
          size="small"
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AddFeeStructureDialog;
