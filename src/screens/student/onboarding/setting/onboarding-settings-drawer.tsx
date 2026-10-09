'use client';

import type { ReactNode } from 'react';

import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Button, Drawer, Divider, IconButton, Typography, CircularProgress } from '@mui/material';

export function SettingsDrawer({
  open,
  title,
  description,
  descriptionDisplay = 'inline',
  icon,
  statusLabel,
  footerNote,
  onClose,
  children,
  onSubmit,
  submitLabel = 'Apply configuration',
  submitIcon = GlobalIcons.submit,
  submitDisabled = false,
  onReset,
  resetDisabled = false,
  showCancel = true,
  busy = false,
}: {
  open: boolean;
  title: string;
  description: string;
  descriptionDisplay?: 'inline' | 'tooltip';
  icon: string;
  statusLabel: string;
  footerNote?: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  submitIcon?: string | null;
  submitDisabled?: boolean;
  onReset?: () => void;
  resetDisabled?: boolean;
  showCancel?: boolean;
  busy?: boolean;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={busy ? undefined : onClose}
      transitionDuration={{ enter: 300, exit: 250 }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-label': title,
        sx: {
          width: { xs: '100%', sm: descriptionDisplay === 'tooltip' ? 'min(840px, 96vw)' : 'min(760px, 95vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{
          p: { xs: 1.5, sm: 2 },
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          {descriptionDisplay === 'inline' && (
            <Box
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                bgcolor: 'action.selected',
                color: 'text.secondary',
              }}
            >
              <Iconify icon={icon} width={22} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography component="h2" variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>
              {descriptionDisplay === 'tooltip' && (
                <>
                  {statusLabel && <Label color="default" variant="outlined">{statusLabel}</Label>}
                  <CustomTooltip arrow placement="bottom" title={description}>
                    <IconButton size="small" aria-label={`${title} information`}>
                      <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
                    </IconButton>
                  </CustomTooltip>
                </>
              )}
            </Stack>
            {descriptionDisplay === 'inline' && (
              <Typography variant="caption" color="text.secondary">{description}</Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {descriptionDisplay === 'inline' && (
            <Label
              color="default"
              variant="outlined"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {statusLabel}
            </Label>
          )}
          <IconButton
            aria-label={`Close ${title}`}
            onClick={onClose}
            disabled={busy}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Scrollbar sx={{ height: 1, p: { xs: 1.5, sm: 2 }, bgcolor: descriptionDisplay === 'tooltip' ? 'background.neutral' : 'background.paper' }}>
          <Box component="fieldset" disabled={busy} inert={busy} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
            {children}
          </Box>
        </Scrollbar>
        {busy && (
          <Stack
            role="status"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', opacity: 0.9 }}
          >
            <CircularProgress size={26} />
            <Typography variant="body2">Saving configuration…</Typography>
          </Stack>
        )}
      </Box>
      <Divider />
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2, py: 1.75, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        {footerNote ? (
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {footerNote}
          </Typography>
        ) : <Box sx={{ flex: 1 }} />}
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ flexShrink: 0 }}>
          {onReset ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.resetIcon} width={18} />}
              disabled={busy || resetDisabled}
              onClick={onReset}
            >
              Reset
            </Button>
          ) : null}
          {showCancel ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
          ) : null}
          <LoadingButton
            variant="contained"
            size="small"
            startIcon={submitIcon ? <Iconify icon={submitIcon} width={18} /> : undefined}
            loading={busy}
            disabled={busy || submitDisabled}
            onClick={onSubmit}
          >
            {submitLabel}
          </LoadingButton>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export function SettingsSectionCard({
  icon,
  title,
  description,
  descriptionDisplay = 'inline',
  children,
}: {
  icon: string;
  title: string;
  description: string;
  descriptionDisplay?: 'inline' | 'tooltip';
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: descriptionDisplay === 'tooltip' ? 2 : undefined }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems={descriptionDisplay === 'tooltip' ? 'center' : 'flex-start'}>
          <Box
            sx={{
              width: descriptionDisplay === 'tooltip' ? 24 : 36,
              height: descriptionDisplay === 'tooltip' ? 24 : 36,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: descriptionDisplay === 'tooltip' ? 'transparent' : 'background.neutral',
              color: 'text.secondary',
            }}
          >
            <Iconify icon={icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography component="h3" variant="subtitle2">{title}</Typography>
              {descriptionDisplay === 'tooltip' && (
                <CustomTooltip arrow placement="right" title={description}>
                  <IconButton size="small" aria-label={`${title} information`}>
                    <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
                  </IconButton>
                </CustomTooltip>
              )}
            </Stack>
            {descriptionDisplay === 'inline' && (
              <Typography variant="caption" color="text.secondary">{description}</Typography>
            )}
          </Box>
        </Stack>
        <Stack spacing={descriptionDisplay === 'tooltip' ? 2 : 1.5}>{children}</Stack>
      </Stack>
    </Card>
  );
}

