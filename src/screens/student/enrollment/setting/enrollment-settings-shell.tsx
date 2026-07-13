'use client';

import type { ReactNode, MouseEvent } from 'react';

import { useState, useEffect } from 'react';
import { RouterLink } from 'src/routes/components';
import MenuRounded from '@mui/icons-material/MenuRounded';
import { studentPaths } from 'src/constants/student-menu';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Box,
  List,
  Paper,
  Stack,
  Button,
  Dialog,
  Drawer,
  Divider,
  ListItem,
  IconButton,
  Typography,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
  ListItemButton,
} from '@mui/material';

const sections = [
  ['Journey', studentPaths.enrollment.settingsSections.journey],
  ['Inquiry Capture', studentPaths.enrollment.settingsSections.inquiryCapture],
  ['Routing & Scoring', studentPaths.enrollment.settingsSections.routingScoring],
  ['Entrance Exams', studentPaths.enrollment.settingsSections.entranceExams],
  ['Registration & Documents', studentPaths.enrollment.settingsSections.registrationDocuments],
  ['Offers & Seats', studentPaths.enrollment.settingsSections.offersSeats],
  ['Activation', studentPaths.enrollment.settingsSections.activation],
  ['Governance', studentPaths.enrollment.settingsSections.governance],
  ['Communications', studentPaths.enrollment.settingsSections.communications],
  ['Automation', studentPaths.enrollment.settingsSections.automation],
] as const;

export function EnrollmentSettingsShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDirty, setIsDirty] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = sections.find(([, href]) => pathname === href) ?? sections[0];
  const cycle = searchParams.get('cycle');
  const sectionHref = (href: string) =>
    cycle ? `${href}?cycle=${encodeURIComponent(cycle)}` : href;

  useEffect(() => {
    const handleDirtyState = (event: Event) => {
      setIsDirty(Boolean((event as CustomEvent<{ dirty?: boolean }>).detail?.dirty));
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('admissions-settings-dirty', handleDirtyState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('admissions-settings-dirty', handleDirtyState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const handleNavigation = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isDirty || href.split('?')[0] === pathname) return;
    event.preventDefault();
    setPendingHref(href);
  };

  const discardAndContinue = () => {
    if (!pendingHref) return;
    setIsDirty(false);
    window.dispatchEvent(new CustomEvent('admissions-settings-discard'));
    router.push(pendingHref);
    setPendingHref(null);
  };

  const navigation = (
    <List disablePadding aria-label="Enrollment settings categories">
      {sections.map(([label, href]) => (
        <ListItem key={href} disablePadding>
          <ListItemButton
            component={RouterLink}
            href={sectionHref(href)}
            selected={pathname === href}
            aria-current={pathname === href ? 'page' : undefined}
            onClick={(event) => handleNavigation(event, sectionHref(href))}
            sx={{ minHeight: 44, borderRadius: 0.75 }}
          >
            <ListItemText primary={label} primaryTypographyProps={{ variant: 'body2' }} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h5" component="h1">
          Enrollment Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure the admission journey for the selected academic year.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{ p: 1, borderRadius: 1, display: { xs: 'block', md: 'none' } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Settings Category
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {activeSection[0]}
            </Typography>
          </Box>
          <IconButton
            aria-label="Open Enrollment settings menu"
            onClick={() => setMobileOpen(true)}
          >
            <MenuRounded />
          </IconButton>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '230px minmax(0, 1fr)' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 0.75,
            borderRadius: 1,
            display: { xs: 'none', md: 'block' },
            position: 'sticky',
            top: 88,
          }}
        >
          {navigation}
        </Paper>
        <Box sx={{ minWidth: 0 }}>{children}</Box>
      </Box>

      <Drawer
        anchor="bottom"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '78vh',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            overscrollBehavior: 'contain',
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
          <Typography variant="subtitle1">Enrollment Settings</Typography>
          <IconButton
            aria-label="Close Enrollment settings menu"
            onClick={() => setMobileOpen(false)}
          >
            <CloseRounded />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ p: 0.75 }}>{navigation}</Box>
      </Drawer>

      <Dialog
        open={Boolean(pendingHref)}
        onClose={() => setPendingHref(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Discard Unsaved Changes?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Changes in this settings category have not been saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingHref(null)}>Stay Here</Button>
          <Button color="error" variant="contained" onClick={discardAndContinue}>
            Discard & Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
