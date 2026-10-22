import type { AdmissionDocumentClassOption } from 'src/redux/student/admissions/admission-document-settings-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { useId, useRef, useMemo, useState } from 'react';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  Box,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

type Props = {
  classes: AdmissionDocumentClassOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  onBlur: () => void;
  error: boolean;
  helperText: string;
  isLoading: boolean;
  disabled: boolean;
};

export function DocumentClassPicker({
  classes,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  isLoading,
  disabled,
}: Props) {
  const anchor = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const popover = usePopover();
  const titleId = useId();
  const [board, setBoard] = useState('');
  const [search, setSearch] = useState('');
  const options = useMemo(
    () =>
      classes.map((item) => {
        // The existing lookup returns year / board / medium / stage. Keep IDs intact;
        // the year is deliberately omitted from this picker's display and filters.
        const parts = item.context.split('/').map((part) => part.trim());
        const [itemBoard = '', ...details] = parts.length >= 4 ? parts.slice(1) : parts;
        return { ...item, board: itemBoard, details: details.filter(Boolean).join(' · ') };
      }),
    [classes]
  );
  const boards = [...new Set(options.map((item) => item.board).filter(Boolean))].sort();
  const activeBoard = boards.includes(board) ? board : '';
  const query = search.trim().toLocaleLowerCase();
  const visible = options.filter(
    (item) =>
      (!activeBoard || item.board === activeBoard) &&
      `${item.name} ${item.board} ${item.details}`.toLocaleLowerCase().includes(query)
  );
  const missing = value.filter((id) => !options.some((item) => item.id === id));
  const countLabel = `${value.length} ${value.length === 1 ? 'class' : 'classes'} selected`;
  const close = () => {
    popover.onClose();
    setSearch('');
    onBlur();
  };
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
      <CustomSelect
        label="Board"
        size="small"
        value={activeBoard || 'all'}
        options={[
          { value: 'all', label: 'All boards' },
          ...boards.map((item) => ({ value: item, label: item })),
        ]}
        onChange={(next) => setBoard(next === 'all' ? '' : String(next))}
        isLoading={isLoading}
        disabled={disabled}
        formControlProps={{ sx: { width: { xs: 1, sm: '50%' }, minWidth: 0 } }}
      />
      <Box ref={anchor} sx={{ width: { xs: 1, sm: '50%' }, minWidth: 0 }}>
        <CustomSelect
          size="small"
          fullWidth
          multiple
          label="Classes"
          value={value}
          options={options.map((item) => ({ value: item.id, label: item.name }))}
          renderValue={() => countLabel}
          onChange={() => undefined}
          open={false}
          onOpen={() => popover.setAnchorEl(anchor.current)}
          SelectDisplayProps={{
            'aria-haspopup': 'dialog',
            'aria-expanded': popover.open,
            'aria-controls': popover.open ? `${titleId}-dialog` : undefined,
          }}
          isLoading={isLoading}
          disabled={disabled}
          error={error}
          helperText={helperText}
        />
      </Box>
      <CustomPopover
        open={popover.open && !disabled && !isLoading}
        anchorEl={popover.anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          arrow: { hide: true },
          paper: {
            sx: {
              width: 560,
              maxWidth: 'calc(100% - 32px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              p: 0,
            },
          },
        }}
      >
        <Box
          role="dialog"
          id={`${titleId}-dialog`}
          aria-modal="true"
          aria-labelledby={titleId}
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          <Stack
            spacing={1.5}
            sx={{ p: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography id={titleId} variant="subtitle1">
                Select classes
              </Typography>
              <Typography variant="caption" color="text.secondary" aria-live="polite">
                {value.length} selected
              </Typography>
            </Stack>
            <TextField
              inputRef={searchInput}
              autoFocus
              fullWidth
              size="small"
              label="Search classes"
              placeholder="Class or medium"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={18} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
          <Scrollbar sx={{ minHeight: 0, maxHeight: 320 }}>
            <Box sx={{ p: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
                {activeBoard ? `${activeBoard} classes` : 'All boards'}
              </Typography>
              {visible.map((item) => (
                <FormControlLabel
                  key={item.id}
                  sx={{
                    m: 0,
                    px: 0.5,
                    py: 0.75,
                    width: 1,
                    borderRadius: 1,
                    alignItems: 'center',
                    bgcolor: value.includes(item.id) ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:focus-within': {
                      outline: '2px solid',
                      outlineColor: 'text.primary',
                      outlineOffset: -2,
                    },
                    '& .MuiFormControlLabel-label': { minWidth: 0 },
                  }}
                  control={
                    <Checkbox
                      size="small"
                      checked={value.includes(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {[!activeBoard && item.board, item.details].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                  }
                />
              ))}
              {visible.length === 0 && (
                <Typography role="status" variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  {query
                    ? 'No matching classes. Try another search or board.'
                    : 'No classes are available. Add classes in Institute Setup.'}
                </Typography>
              )}
              {missing.map((id) => (
                <FormControlLabel
                  key={id}
                  sx={{ m: 0, width: 1 }}
                  control={<Checkbox size="small" checked onChange={() => toggle(id)} />}
                  label="Unavailable class (remove or replace)"
                />
              ))}
            </Box>
          </Scrollbar>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
          >
            <Typography variant="body2" color="text.secondary">
              {countLabel}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                disabled={!value.length}
                onClick={() => {
                  onChange([]);
                  searchInput.current?.focus();
                }}
              >
                Clear
              </Button>
              <Button size="small" variant="contained" onClick={close}>
                Done
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CustomPopover>
    </Stack>
  );
}
