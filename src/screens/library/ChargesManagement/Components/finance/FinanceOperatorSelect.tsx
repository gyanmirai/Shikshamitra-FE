'use client';

import type { ReactNode } from 'react';
import type { FinanceExternalSource } from 'src/redux/library/charges-management/finance-external.types';
import type {
  FinanceOperatorOption,
  FinanceOperatorOptionKindValue,
} from 'src/redux/library/charges-management/finance-operator.types';

import { Box, Typography } from '@mui/material';
import { useRef, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  useLazyGetFinanceExternalPostingOptionsQuery,
  useLazyGetFinanceExternalBindingOptionsQuery,
} from 'src/redux/library/charges-management/finance-external-api';

type Props = {
  source: FinanceExternalSource;
  purpose: 'posting' | 'binding';
  optionKind: FinanceOperatorOptionKindValue;
  label: string;
  name: string;
  value: FinanceOperatorOption | null;
  onChange: (value: FinanceOperatorOption | null) => void;
  onBlur: () => void;
  required?: boolean;
  disabled: boolean;
  error?: boolean;
  helperText?: ReactNode;
};

export function FinanceOperatorSelect({
  source,
  purpose,
  optionKind,
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  disabled,
  error,
  helperText,
}: Props) {
  const [findPosting] = useLazyGetFinanceExternalPostingOptionsQuery();
  const [findBinding] = useLazyGetFinanceExternalBindingOptionsQuery();
  const fetchOptions = useCallback(
    async (search: string, page: number) => {
      if (disabled) return { data: [], hasMore: false };
      const input = { source, optionKind, search, page, pageSize: 20 };
      const result = await (
        purpose === 'posting' ? findPosting(input) : findBinding(input)
      ).unwrap();
      return { data: result.items, hasMore: page * 20 < result.totalCount };
    },
    [disabled, findPosting, findBinding, source, optionKind, purpose]
  );

  return (
    <ShakingTextField error={Boolean(error)}>
      <PaginatedSearchSelect<FinanceOperatorOption>
        key={`${source.kind}:${source.sourceId}:${source.sourceVersion}:${purpose}:${optionKind}:${disabled}`}
        label={label}
        name={name}
        required={required}
        size="small"
        fullWidth
        minChars={0}
        value={value}
        disabled={disabled}
        fetchOptions={fetchOptions}
        filterOptions={(options) => options}
        getOptionLabel={(option) =>
          option.versionNumber == null
            ? option.name
            : `${option.name} (version ${option.versionNumber})`
        }
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        getOptionDisabled={(option) => !option.isSelectable}
        onInput={(event) => {
          if (!disabled && value && event.target instanceof HTMLInputElement) onChange(null);
        }}
        onChange={(_, selected) => {
          if (!disabled) onChange(selected);
        }}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key ?? option.id} {...optionProps}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">{option.name}</Typography>
                {option.versionNumber != null && (
                  <Typography variant="caption" color="text.secondary">
                    Version {option.versionNumber}
                  </Typography>
                )}
                {option.blockedReason && (
                  <Typography variant="caption" color="text.secondary">
                    {option.blockedReason}
                  </Typography>
                )}
              </Box>
            </li>
          );
        }}
      />
    </ShakingTextField>
  );
}

export function useFinanceActionBusy(busy: boolean, onBusyChange: (busy: boolean) => void) {
  const callback = useRef(onBusyChange);
  callback.current = onBusyChange;
  useEffect(() => {
    callback.current(busy);
    return () => callback.current(false);
  }, [busy]);
}

export function useFinanceActionDirty(dirty: boolean, onDirtyChange?: (dirty: boolean) => void) {
  const callback = useRef(onDirtyChange);
  callback.current = onDirtyChange;
  useEffect(() => {
    callback.current?.(dirty);
    return () => callback.current?.(false);
  }, [dirty]);
}
