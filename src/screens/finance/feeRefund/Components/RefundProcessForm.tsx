'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';

import StudentRefundInfo from './StudentRefundInfo';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IRefundProcessFormProps } from '../type';

export const getInitialPaymentDetails = (method?: string) => {
  if (!method || !(method in paymentMethodsConfig)) return {};
  return paymentMethodsConfig[method as keyof typeof paymentMethodsConfig].reduce(
    (acc, field) => {
      acc[field.name] = ''; // default empty
      return acc;
    },
    {} as Record<string, any>
  );
};

const RefundProcessForm: React.FC<IRefundProcessFormProps> = ({ open, onClose, student }) => {
  const handleSubmit = () => {
    shikshaMitraToast.success({ message: 'Remarks submitted successfully' });
    onClose(null, true);
  };

  return (
    <>
      <DialogScrollContent>
        <StudentRefundInfo student={student} />
      </DialogScrollContent>

      {/* 🔹 Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose(null, false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="soft"
          color="success"
          onClick={handleSubmit}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Generate Receipt
        </Button>
      </DialogActions>
    </>
  );
};

export default RefundProcessForm;
