'use client';

import type { TextFieldProps, InputLabelProps } from '@mui/material';

import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { acceptsNumericDraft } from '../../collectionNumericLimits';

import type { CollectionNumericKind } from '../../collectionNumericLimits';

// The existing currency formatter rounds to rupees and sanitizes pasted text, so it
// cannot preserve these two-decimal policy values or reject scientific notation.
export default function CollectionNumberField({
  kind = 'amount',
  value,
  onChange,
  onPaste,
  slotProps,
  ...props
}: TextFieldProps & { kind?: CollectionNumericKind }) {
  const displayValue =
    typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
      : String(value ?? '');
  const [draft, setDraft] = useState(displayValue);
  useEffect(() => {
    setDraft((current) =>
      Number(current) === Number(value) && current !== '' && value !== '' && value != null
        ? current
        : displayValue
    );
  }, [value, displayValue]);

  return (
    <TextField
      {...props}
      type="text"
      value={draft}
      onPaste={(event) => {
        const input = event.target as HTMLInputElement;
        const proposed =
          draft.slice(0, input.selectionStart ?? draft.length) +
          event.clipboardData.getData('text') +
          draft.slice(input.selectionEnd ?? draft.length);
        if (!acceptsNumericDraft(proposed, kind)) {
          event.preventDefault();
          return;
        }
        onPaste?.(event);
      }}
      onChange={(event) => {
        if (!acceptsNumericDraft(event.target.value, kind)) return;
        setDraft(event.target.value);
        onChange?.(event);
      }}
      slotProps={{
        ...slotProps,
        inputLabel: (ownerState) =>
          ({
            ...(typeof slotProps?.inputLabel === 'function'
              ? slotProps.inputLabel(ownerState)
              : slotProps?.inputLabel),
            shrink: true,
          }) as Partial<InputLabelProps>,
        htmlInput: {
          ...slotProps?.htmlInput,
          inputMode: kind === 'days' ? 'numeric' : 'decimal',
          maxLength: kind === 'days' ? 3 : kind === 'percentage' ? 6 : 9,
        },
      }}
    />
  );
}
