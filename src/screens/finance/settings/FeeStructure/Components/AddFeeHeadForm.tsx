import type { FormikProps } from 'formik';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { DialogScrollContent } from 'src/components/customDialog';
import { Button, DialogActions, FormHelperText } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IFeeStructure } from '../type';

interface FeeHeadOption {
  category: string;
  feeHead: string;
}

interface Props {
  formik: FormikProps<IFeeStructure>;
  className: string;
  feeStructureIndex: number;
  onClose: (e: any, isSubmit: boolean) => void;
}

const feeHeadOptions: FeeHeadOption[] = [
  { category: 'Academics', feeHead: 'Tuition Fee' },
  { category: 'Academics', feeHead: 'Library Fee' },
  { category: 'Transport', feeHead: 'Transport Fee' },
];

const AddFeeHeadDialogContent: React.FC<Props> = ({
  formik,
  className,
  feeStructureIndex,
  onClose,
}) => {
  const [selectedFeeHead, setSelectedFeeHead] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!selectedFeeHead.length) {
      setError('Please select at least one Fee Head');
      return;
    }

    // Get current fee structure array for the class
    const classFeeStructures = formik.values.feeStructureClasses[className] || [];

    // Get the specific fee structure to update
    const currentStructure = classFeeStructures[feeStructureIndex];

    if (!currentStructure) {
      console.error('Fee structure not found at index', feeStructureIndex);
      return;
    }

    const updatedItems = [...(currentStructure.feeItems || [])];

    // Prevent duplicates
    const existingHeads = new Set(updatedItems.map((item) => item.feeHead));
    const duplicates = selectedFeeHead.filter((feeHeadValue) => existingHeads.has(feeHeadValue));

    if (duplicates.length) {
      setError(`Fee Head(s) already added: ${duplicates.join(', ')}`);
      return;
    }

    // Add only new fee heads
    selectedFeeHead.forEach((feeHeadValue) => {
      const selected = feeHeadOptions.find((opt) => opt.feeHead === feeHeadValue);
      if (selected) {
        updatedItems.push({
          feeCategory: selected.category,
          feeHead: selected.feeHead,
          amount: 0,
          isOneTime: false,
          required: true,
        });
      }
    });

    // Replace feeItems for the specific fee structure
    const updatedStructure = {
      ...currentStructure,
      feeItems: updatedItems,
    };

    const updatedClassFeeStructures = [...classFeeStructures];
    updatedClassFeeStructures[feeStructureIndex] = updatedStructure;

    // Set back in formik
    formik.setFieldValue(`feeStructureClasses.${className}`, updatedClassFeeStructures);

    setSelectedFeeHead([]);
    setError('');
    onClose(null, true);
  };

  return (
    <BackPopUpChecked initialValues={selectedFeeHead} currentValues={selectedFeeHead}>
      <DialogScrollContent>
        <CustomSelect
          name="feeHead"
          label="Fee Head *"
          multiple
          options={feeHeadOptions}
          value={selectedFeeHead}
          labelKey="feeHead"
          valueKey="feeHead"
          onChange={(value) => {
            setSelectedFeeHead(value as string[]);
            if (error) setError('');
          }}
          formControlProps={{ fullWidth: true, error: !!error }}
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
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

export default AddFeeHeadDialogContent;
