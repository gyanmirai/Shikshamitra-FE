'use client';

import { Drawer } from '@mui/material';
import { useState, useCallback } from 'react';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';

import ConcessionTypeForm from './ConcessionTypeForm';

import type { IConcessionTypeFormProps } from '../type';

/** One responsive editor for both create and update sessions. */
export default function ConcessionTypeDrawer(props: IConcessionTypeFormProps) {
  const { open } = props;
  return open.value ? <ConcessionTypeDrawerSession {...props} /> : null;
}

function ConcessionTypeDrawerSession(props: IConcessionTypeFormProps) {
  const [busy, setBusy] = useState(false);
  const { onBusyChange, onClose, editData } = props;
  const handleBusyChange = useCallback(
    (value: boolean) => {
      setBusy(value);
      onBusyChange?.(value);
    },
    [onBusyChange]
  );
  const close = () => {
    if (!busy) onClose(null, false);
  };
  return (
    <Drawer
      anchor="right"
      open
      onClose={close}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'concession-type-editor-title',
        sx: {
          width: { xs: '100%', sm: 'min(840px, 96vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <FinancePolicyDrawerHeader
        title={editData ? 'Edit Concession Type' : 'Add Concession Type'}
        titleId="concession-type-editor-title"
        helpText="Define the concession type and supporting document requirements for concession requests."
        onClose={close}
        disabled={busy}
      />
      <ConcessionTypeForm {...props} onBusyChange={handleBusyChange} />
    </Drawer>
  );
}
