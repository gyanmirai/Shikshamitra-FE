'use client';

import type { OperationalOverview } from 'src/redux/hr/hrOperationalDashboardApi';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Stack,
  Badge,
  Button,
  Drawer,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { dailyStatus } from '../operational-dashboard-state';

type StaffFilters = { group: string; stage: string; department: string; shift: string };
type Props = {
  value: StaffFilters & { status: string; search: string };
  options?: OperationalOverview['filters'];
  onChange: (values: Record<string, string>) => void;
};
const emptyFilters: StaffFilters = { group: '', stage: '', department: '', shift: '' };
const titles = {
  group: 'Staff group',
  stage: 'Medium / stage',
  department: 'Department',
  shift: 'Shift',
};

export default function OperationalDashboardFilters({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [draft, setDraft] = useState<StaffFilters>(emptyFilters);
  const choices = {
    group: [
      { id: 'teaching', name: 'Teaching' },
      { id: 'nonTeaching', name: 'Non-teaching' },
    ],
    stage: options?.stages || [],
    department: (options?.departments || []).map((name) => ({ id: name, name })),
    shift: options?.shifts || [],
  };
  const name = (key: keyof StaffFilters, selected: string) =>
    choices[key].find((item) => item.id === selected)?.name || `Unavailable: ${selected}`;
  const field = (
    key: keyof StaffFilters,
    values: StaffFilters,
    change: (next: StaffFilters) => void
  ) => (
    <TextField
      key={key}
      select
      size="small"
      label={titles[key]}
      value={values[key]}
      onChange={(event) => change({ ...values, [key]: event.target.value })}
      slotProps={{
        select: {
          displayEmpty: true,
          SelectDisplayProps: { 'aria-label': titles[key], 'aria-labelledby': undefined },
        },
        inputLabel: { shrink: true },
      }}
      sx={{ minWidth: 0, width: 1 }}
    >
      <MenuItem value="">
        {key === 'stage'
          ? 'All authorized stages'
          : `All ${key === 'group' ? 'staff groups' : key === 'department' ? 'departments' : 'shifts'}`}
      </MenuItem>
      {values[key] && !choices[key].some((item) => item.id === values[key]) ? (
        <MenuItem value={values[key]}>{name(key, values[key])}</MenuItem>
      ) : null}
      {choices[key].map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.name}
        </MenuItem>
      ))}
    </TextField>
  );
  const filterCount = Object.keys(emptyFilters).filter(
    (key) => value[key as keyof StaffFilters]
  ).length;
  const chips = Object.keys(emptyFilters)
    .filter((key) => value[key as keyof StaffFilters])
    .map((key) => ({
      key,
      label: `${titles[key as keyof StaffFilters]}: ${name(key as keyof StaffFilters, value[key as keyof StaffFilters])}`,
    }));
  if (value.status)
    chips.push({
      key: 'status',
      label: `Status: ${dailyStatus[value.status as keyof typeof dailyStatus]?.label || 'Needs review'}`,
    });
  if (value.search) chips.push({ key: 'search', label: `Search: ${value.search}` });

  return (
    <Box component="section" aria-label="Dashboard filters" sx={{ px: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ display: { xs: 'none', md: 'flex' }, width: 520, maxWidth: '75%' }}
        >
          {field('group', value, (next) => onChange({ group: next.group }))}
          {field('stage', value, (next) => onChange({ stage: next.stage }))}
        </Stack>
        <Badge badgeContent={filterCount} color="primary">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="mdi:filter-variant" />}
            aria-label={`Filters${filterCount ? `, ${filterCount} applied` : ''}`}
            onClick={() => {
              setDraft({
                group: value.group,
                stage: value.stage,
                department: value.department,
                shift: value.shift,
              });
              setOpen(true);
            }}
          >
            Filters
          </Button>
        </Badge>
        {chips.length ? (
          <Button
            size="small"
            onClick={() => onChange({ ...emptyFilters, status: '', search: '' })}
          >
            Clear filters
          </Button>
        ) : null}
      </Stack>
      {chips.length ? (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 1.5 }}
          aria-label="Applied filters"
        >
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              size="small"
              label={chip.label}
              onDelete={() => onChange({ [chip.key]: '' })}
              slotProps={{ root: { 'aria-label': `Remove ${chip.label}` } }}
              sx={{ maxWidth: 1, '& .MuiChip-label': { overflow: 'hidden' } }}
            />
          ))}
        </Stack>
      ) : null}
      <Drawer
        anchor="right"
        open={open}
        aria-label="Staff filters"
        transitionDuration={reduceMotion ? 0 : undefined}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 360 } },
            role: 'dialog',
            'aria-labelledby': 'hr-filter-title',
            'aria-label': 'Staff filters',
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 1.5 }}
        >
          <Typography id="hr-filter-title" variant="h6" component="h2">
            Staff filters
          </Typography>
          <IconButton
            aria-label="Close staff filters"
            onClick={() => setOpen(false)}
            sx={{ width: 44, height: 44 }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Stack spacing={2.5} sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Filters apply to summary counts and the staff list.
          </Typography>
          {(Object.keys(emptyFilters) as Array<keyof StaffFilters>).map((key) =>
            field(key, draft, setDraft)
          )}
          <Button
            size="small"
            onClick={() => setDraft(emptyFilters)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Reset selections
          </Button>
        </Stack>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2.5 }}>
          <Button size="small" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            Apply filters
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
