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

import type { IClassWiseFeeItem } from '../type';

interface Props {
  existingFeeHeadIds: Set<string>;
  onAdd: (items: IClassWiseFeeItem[]) => void;
  onClose: () => void;
}

/**
 * Fee-head picker that works with the independent card architecture.
 * Instead of writing to formik, it calls `onAdd` with the selected items.
 */
const AddFeeHeadToCardDialog: React.FC<Props> = ({ existingFeeHeadIds, onAdd, onClose }) => {
  const [selectedFeeHeadIds, setSelectedFeeHeadIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: feeHeadData, isLoading: isFeeHeadLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
    params: { academicYearId: currentYear?.id },
  });

  const handleSubmit = () => {
    if (!selectedFeeHeadIds.length) {
      setError('Please select at least one Fee Head');
      return;
    }

    const newItems: IClassWiseFeeItem[] = selectedFeeHeadIds
      .map((id) => feeHeadData?.items?.find((opt: any) => opt.id === id))
      .filter(Boolean)
      .map((opt: any) => ({
        feeHeadId: opt.id,
        feeHeadName: opt.name,
        feeCategoryName: opt.feeCategoryName ?? opt.categoryName ?? opt.feeCategory?.name,
        amount: 0,
        isOneTime: false,
        isOptional: false,
      }));

    onAdd(newItems);
    onClose();
  };

  return (
    <BackPopUpChecked initialValues={selectedFeeHeadIds} currentValues={selectedFeeHeadIds}>
      <DialogScrollContent>
        <CustomSelect
          name="feeHead"
          label="Fee Head *"
          multiple
          isLoading={isFeeHeadLoading}
          value={selectedFeeHeadIds}
          onChange={(value: any) => {
            setSelectedFeeHeadIds(value);
            if (error) setError('');
          }}
          options={feeHeadData?.items || []}
          labelKey="name"
          valueKey="id"
          error={!!error}
          helperText={error}
        />
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
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
          Add
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AddFeeHeadToCardDialog;
