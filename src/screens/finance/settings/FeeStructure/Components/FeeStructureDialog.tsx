import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Button, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';

import type { IFeeStructure } from '../type';

interface Props {
  formik: FormikProps<IFeeStructure>;
  className: string;
  onClose: (e: any, isSubmit: boolean) => void;
  editIndex?: number | null; // pass index if editing
}

const AddFeeStructureDialog: React.FC<Props> = ({ formik, className, onClose, editIndex }) => {
  const [feeStructureName, setFeeStructureName] = useState('');
  const [error, setError] = useState('');

  // Pre-fill name if editing
  useEffect(() => {
    if (editIndex !== null && editIndex !== undefined) {
      const existing = formik.values.feeStructureClasses[className][editIndex];
      if (existing) {
        setFeeStructureName(existing.name);
      }
    }
  }, [editIndex, className, formik.values.feeStructureClasses]);

  const handleSubmit = () => {
    if (!feeStructureName.trim()) {
      setError('Fee Structure Name is required');
      return;
    }

    const updated = [...(formik.values.feeStructureClasses[className] ?? [])];

    if (editIndex !== null && editIndex !== undefined) {
      // Edit mode
      updated[editIndex] = {
        ...updated[editIndex],
        name: feeStructureName,
      };
    } else {
      // Add mode
      updated.push({
        _id: crypto.randomUUID(),
        name: feeStructureName || `Fee Structure ${updated.length + 1}`,
        status: FeeStructureLockStatusType.Unlocked,
        feeHeads: [],
      });
    }

    formik.setFieldValue(`feeStructureClasses.${className}`, updated);
    setFeeStructureName('');
    setError('');
    onClose(null, true);
  };

  return (
    <BackPopUpChecked initialValues={feeStructureName} currentValues={feeStructureName}>
      <DialogScrollContent>
        <ShakingTextField error={!!error}>
          <TextField
            fullWidth
            size="small"
            label="Fee Structure Name *"
            value={feeStructureName}
            onChange={(e) => {
              setFeeStructureName(e.target.value);
              if (error) setError('');
            }}
            error={!!error}
            helperText={error}
          />
        </ShakingTextField>
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
          {editIndex !== null && editIndex !== undefined ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AddFeeStructureDialog;
