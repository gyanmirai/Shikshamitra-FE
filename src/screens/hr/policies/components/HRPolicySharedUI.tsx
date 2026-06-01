'use client';

import type { SelectChangeEvent } from '@mui/material/Select';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Table,
  Button,
  Portal,
  Select,
  Switch,
  Tooltip,
  Divider,
  Backdrop,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  FormControl,
  DialogTitle,
  TableContainer,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import type { PolicyOperationState } from '../types/hr-policy-workspace.types';

// ─── HolidayMetricCard ────────────────────────────────────────────────────────

/**
 * Memoization Justification:
 * Pure display card — receives only primitive props (label: string, value: number,
 * color: string). React.memo prevents unnecessary DOM reconciliation when the
 * parent holiday-review section re-renders due to filter state changes that do not
 * affect these metric values.
 */
export const HolidayMetricCard = React.memo(
  ({ label, value, color = 'text.primary' }: { label: string; value: number; color?: string }) => (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 1.25,
        minWidth: 130,
        flex: { xs: '1 1 45%', sm: '0 0 auto' },
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  )
);

// ─── StatusChip ───────────────────────────────────────────────────────────────

/**
 * Memoization Justification:
 * Rendered once per row in policy tables with potentially 200+ rows. React.memo
 * ensures the chip does not re-render when table-level state (sort, page) changes
 * but row data remains the same.
 */
export const StatusChip = React.memo(
  ({ status, isDefault }: { status: string; isDefault?: boolean }) => (
    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
      <Chip
        size="small"
        label={status}
        color={status === 'active' ? 'success' : status === 'archived' ? 'default' : 'warning'}
      />
      {isDefault ? <Chip size="small" label="Default" color="primary" variant="outlined" /> : null}
    </Stack>
  )
);

// ─── EmptyRows ────────────────────────────────────────────────────────────────

export function EmptyRows({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          {message}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

// ─── PolicyName ───────────────────────────────────────────────────────────────

export function PolicyName({
  id,
  items,
}: {
  id?: string | null;
  items: Array<{ id: string; name: string }>;
}) {
  if (!id) return <>-</>;
  return <>{items.find((item) => item.id === id)?.name || 'Unknown policy'}</>;
}

// ─── InfoTooltipIcon ──────────────────────────────────────────────────────────

export function InfoTooltipIcon({ title }: { title: string }) {
  return (
    <CustomTooltip arrow placement="right" sx={{ textAlign: 'justify' }} title={title}>
      <Iconify
        icon="lucide:info"
        sx={{ cursor: 'pointer' }}
        color="info.main"
        width={16}
        height={16}
      />
    </CustomTooltip>
  );
}

// ─── DrawerHeader ─────────────────────────────────────────────────────────────

export function DrawerHeader({
  title,
  subtitle,
  helpText,
  onClose,
  closeDisabled = false,
}: {
  title: string;
  subtitle?: string;
  helpText?: string;
  onClose: () => void;
  closeDisabled?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1,
        py: 1.5,
        px: 2,
      }}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {helpText ? <InfoTooltipIcon title={helpText} /> : null}
        </Stack>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      <IconButton
        aria-label="close"
        onClick={onClose}
        disabled={closeDisabled}
        sx={{
          mt: 0.25,
        }}
      >
        <Iconify icon="mdi:close" />
      </IconButton>
    </Box>
  );
}

// ─── PolicyOperationOverlay ───────────────────────────────────────────────────

export function PolicyOperationOverlay({ operation }: { operation: PolicyOperationState }) {
  if (!operation) return null;

  return (
    <Portal>
      <Backdrop
        open
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 2,
          px: 2,
          color: 'text.primary',
          bgcolor: 'rgba(15, 23, 42, 0.44)',
          backdropFilter: 'blur(3px)',
        }}
      >
        <Paper
          elevation={8}
          role="status"
          aria-live="polite"
          sx={{
            width: 'min(360px, 100%)',
            p: 3,
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={42} thickness={4.5} />
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">{operation.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {operation.message}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Backdrop>
    </Portal>
  );
}

// ─── PolicyDrawerLayout ───────────────────────────────────────────────────────

export function PolicyDrawerLayout({
  title,
  helpText,
  error,
  onClose,
  onSave,
  loading,
  disabled,
  disabledReason,
  operation,
  children,
}: {
  title: string;
  /** Shown as an info tooltip icon next to the drawer title. */
  helpText?: string;
  error?: string;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  disabled: boolean;
  disabledReason?: string;
  operation?: PolicyOperationState;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        bgcolor: 'background.default',
      }}
    >
      <DrawerHeader
        title={title}
        helpText={helpText}
        onClose={onClose}
        closeDisabled={Boolean(operation)}
      />
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <Stack spacing={2.5} sx={{ width: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {children}
        </Stack>
      </Box>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Iconify icon="basil:cross-solid" />}
          onClick={onClose}
          disabled={Boolean(operation)}
          size="small"
        >
          Cancel
        </Button>
        <Tooltip title={disabled && disabledReason ? disabledReason : ''}>
          <span>
            <LoadingButton
              variant="contained"
              disabled={disabled || Boolean(operation)}
              loading={loading && !operation}
              startIcon={<Iconify icon="material-symbols-light:save" width={20} height={20} />}
              onClick={onSave}
              size="small"
            >
              {operation ? 'Saving...' : 'Submit'}
            </LoadingButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ─── PolicySection ────────────────────────────────────────────────────────────

export function PolicySection({
  title,
  description,
  help,
  compact = false,
  children,
}: {
  title: string;
  description?: string;
  help?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: compact ? { xs: 2, sm: 2.25 } : { xs: 2, sm: 2.5 },
        bgcolor: 'background.paper',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(145, 158, 171, 0.24)' : 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={compact ? 1.5 : 2}>
        <Box>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography variant="subtitle1" sx={{ lineHeight: 1.35 }}>
              {title}
            </Typography>
            {help ? <InfoTooltipIcon title={help} /> : null}
          </Stack>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}

// ─── DrawerFormGrid ───────────────────────────────────────────────────────────

export function DrawerFormGrid({
  children,
  columns = 2,
  alignItems = 'flex-start',
  rowGap = 2,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  alignItems?: 'center' | 'flex-start';
  rowGap?: number;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: `repeat(${columns}, minmax(0, 1fr))`,
        },
        columnGap: 2,
        rowGap,
        alignItems,
      }}
    >
      {children}
    </Box>
  );
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

export function FieldLabel({ label, help }: { label: React.ReactNode; help?: string }) {
  return (
    <Stack component="span" direction="row" spacing={0.5} alignItems="center">
      <Box component="span">{label}</Box>
      {help ? <InfoTooltipIcon title={help} /> : null}
    </Stack>
  );
}

// ─── DrawerField ──────────────────────────────────────────────────────────────

export function DrawerField({
  label,
  help,
  helperText,
  children,
}: {
  label: React.ReactNode;
  help?: string;
  helperText?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
      <Typography
        component="label"
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1.2 }}
      >
        <FieldLabel label={label} help={help} />
      </Typography>
      {children}
      {helperText ? (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          {helperText}
        </Typography>
      ) : null}
    </Stack>
  );
}

// ─── DrawerSelectField ────────────────────────────────────────────────────────

export function DrawerSelectField({
  label,
  help,
  value,
  onChange,
  children,
  disabled,
}: {
  label: React.ReactNode;
  help?: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <DrawerField label={label} help={help}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <Select value={value} onChange={onChange}>
          {children}
        </Select>
      </FormControl>
    </DrawerField>
  );
}

// ─── DrawerSwitchField ────────────────────────────────────────────────────────

export function DrawerSwitchField({
  label,
  help,
  checked,
  onChange,
  disabled,
  compact = false,
}: {
  label: React.ReactNode;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        minHeight: compact ? 40 : 65,
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-end',
      }}
    >
      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
          />
        }
        label={<FieldLabel label={label} help={help} />}
      />
    </Box>
  );
}

// ─── SectionTable ─────────────────────────────────────────────────────────────

export function SectionTable({
  children,
  columns,
}: {
  children: React.ReactNode;
  columns: string[];
}) {
  return (
    <TableContainer
      sx={{ border: (theme) => `1px solid ${theme.vars.palette.divider}`, borderRadius: 1 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} align={column === 'Actions' ? 'right' : 'left'}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── DrawerTitle (for dialogs) ─────────────────────────────────────────────────

export function DrawerDialogTitle({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <DialogTitle sx={{ pr: 6 }}>
      {children}
      <IconButton
        aria-label="Close dialog"
        onClick={onClose}
        sx={{ position: 'absolute', top: 12, right: 12 }}
      >
        <Iconify icon="mdi:close" />
      </IconButton>
    </DialogTitle>
  );
}
