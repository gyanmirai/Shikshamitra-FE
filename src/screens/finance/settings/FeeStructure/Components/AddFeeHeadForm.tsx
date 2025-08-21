// AddFeeHeadDialogContent.tsx
import type { FormikProps } from 'formik';

import React, { useState } from 'react';

import { Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IFeeStructure } from '../type';

interface FeeHeadOption {
  category: string;
  feeHead: string;
}

interface Props {
  formik: FormikProps<IFeeStructure>;
  className: string;
  onClose: (e: any, isSubmit: boolean) => void;
}

const feeHeadOptions: FeeHeadOption[] = [
  { category: 'Academics', feeHead: 'Tuition Fee' },
  { category: 'Academics', feeHead: 'Library Fee' },
  { category: 'Transport', feeHead: 'Transport Fee' },
];

const AddFeeHeadDialogContent: React.FC<Props> = ({ formik, className, onClose }) => {
  const [selectedFeeHead, setSelectedFeeHead] = useState<string[]>([]);

  const handleSubmit = () => {
    // Handle case when no fee heads are selected
    if (!selectedFeeHead.length) return;

    const currentClassData = formik.values.feeStructureClasses[className] || { feeItems: [] };
    const updatedItems = [...(currentClassData.feeItems || [])];

    // Add each selected fee head to the items array
    (selectedFeeHead as string[]).forEach((feeHeadValue) => {
      const selected = feeHeadOptions.find((opt) => opt.feeHead === feeHeadValue);
      if (selected) {
        updatedItems.push({
          feeCategory: selected.category,
          feeHead: selected.feeHead,
          amount: 0,
          required: true,
        });
      }
    });

    formik.setFieldValue(`feeStructureClasses.${className}`, {
      ...currentClassData,
      feeItems: updatedItems,
    });

    onClose(null, true);
    setSelectedFeeHead([]);
  };

  return (
    <BackPopUpChecked initialValues={selectedFeeHead} currentValues={selectedFeeHead}>
      <DialogScrollContent>
        <CustomSelect
          name="feeHead"
          label="Fee Head"
          multiple
          options={feeHeadOptions}
          value={selectedFeeHead}
          labelKey="feeHead"
          valueKey="feeHead"
          onChange={(value) => setSelectedFeeHead(value as string[])}
          formControlProps={{ fullWidth: true }}
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

export default AddFeeHeadDialogContent;
