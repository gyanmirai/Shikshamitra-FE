import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IFeeStructure } from '../type';

interface Props {
  formik: FormikProps<IFeeStructure>;
  className: string;
  feeStructureIndex: number;
  onClose: (e: any, isSubmit: boolean) => void;
}

const AddFeeHeadDialogContent: React.FC<Props> = ({
  formik,
  className,
  feeStructureIndex,
  onClose,
}) => {
  const [selectedFeeHead, setSelectedFeeHead] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: feeHeadData, isLoading: isFeeHeadLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
    params: { academicYearId: currentYear?.id },
  });

  // Get existing fee head IDs from the current fee structure
  const classFeeStructures = formik.values.feeStructureClasses[className] || [];
  const currentStructure = classFeeStructures[feeStructureIndex];
  const existingFeeHeadIds = new Set(
    (currentStructure?.feeHeads || []).map((item: any) => item.feeHeadId)
  );

  // Filter out already added fee heads from options
  const availableFeeHeadOptions =
    feeHeadData?.items?.filter((item: any) => !existingFeeHeadIds.has(item.id)) || [];

  const handleSubmit = () => {
    if (!selectedFeeHead.length) {
      setError('Please select at least one Fee Head');
      return;
    }

    if (!currentStructure) {
      console.error('Fee structure not found at index', feeStructureIndex);
      return;
    }

    const updatedHeads = [...(currentStructure.feeHeads || [])];

    // Add new fee heads
    selectedFeeHead.forEach((feeHeadId) => {
      const selected = feeHeadData?.items?.find((opt: any) => opt.id === feeHeadId);
      if (selected) {
        updatedHeads.push({
          feeHeadId: selected.id,
          feeHeadName: selected.name,
          amount: 0,
          isOneTime: false,
          isOptional: false,
        });
      }
    });

    // Replace feeHeads for the specific fee structure
    const updatedStructure = {
      ...currentStructure,
      feeHeads: updatedHeads,
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
          isLoading={isFeeHeadLoading}
          options={availableFeeHeadOptions}
          value={selectedFeeHead}
          labelKey="name"
          valueKey="id"
          onChange={(value) => {
            setSelectedFeeHead(value as string[]);
            if (error) setError('');
          }}
          error={!!error}
          helperText={error}
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
