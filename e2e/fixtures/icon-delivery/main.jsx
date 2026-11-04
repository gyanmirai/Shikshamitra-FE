import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { _api } from '@iconify/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, CssBaseline, Link, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

const icons = [
  "lucide:landmark",
  "lucide:layout-dashboard",
  "lucide:info",
  "ph:books-light",
  "ph:student",
  "solar:buildings-2-outline",
  "solar:shield-check-outline",
  "solar:square-academic-cap-2-broken",
  "solar:user-check-outline",
  "solar:hamburger-menu-outline",
  "solar:pin-bold",
  "solar:export-bold",
  "solar:eye-bold",
  "solar:magnifer-linear",
  "solar:maximize-square-3-outline",
  "clarity:building-line",
  "clarity:employee-line",
  "fluent-mdl2:office-chat",
  "gis:route",
  "streamline-freehand:human-resources-businessman",
  "mdi:bank-outline",
  "mdi:bell-outline",
  "mdi:cash-plus",
  "mdi:cash-refund",
  "mdi:chart-box-outline",
  "mdi:clipboard-list-outline",
  "mdi:clipboard-text-clock-outline",
  "mdi:cog-outline",
  "mdi:currency-usd",
  "mdi:file-document-outline",
  "mdi:hand-coin-outline",
  "mdi:receipt-text-outline",
  "mdi:source-branch-check",
  "mdi:ticket-percent-outline",
  "mdi:view-dashboard-outline",
  "eva:arrow-ios-downward-fill",
  "eva:arrow-ios-forward-fill",
  "fluent:filter-12-filled"
];
let providerAttempts = 0;
// Provider traffic is blocked in this isolated QA fixture, never in application code.
_api.setFetch(async () => {
  providerAttempts += 1;
  return new Response('{}', { status: 404 });
});

function Preview() {
  const [mode, setMode] = useState('light');
  const [stats, setStats] = useState({ rendered: 0, attempts: 0 });
  const [layout, setLayout] = useState('100%');
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  useEffect(() => {
    const timer = setInterval(() => {
      const rendered = document.querySelectorAll('svg[data-critical-icon]').length;
      setStats((previous) => previous.rendered === rendered && previous.attempts === providerAttempts ? previous : { rendered, attempts: providerAttempts });
    }, 200);
    return () => clearInterval(timer);
  }, []);
  return <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ p: 2, maxWidth: layout, bgcolor: 'background.default', color: 'text.primary' }}>
      <Typography variant="h5" component="h1">Critical finance icons</Typography>
      <Typography role="status">Local icons rendered: {stats.rendered} / {icons.length}. Provider requests: {stats.attempts}.</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
        <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>Toggle color mode</Button>
        <Button onClick={() => setLayout('320px')}>320px layout</Button>
        <Button onClick={() => setLayout('768px')}>768px layout</Button>
        <Button onClick={() => setLayout('100%')}>Full width layout</Button>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 1 }}>
        {icons.map((icon) => <Box key={icon} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, border: 1, borderColor: 'divider' }}>
          <Iconify icon={icon} width={24} aria-label={icon} aria-hidden={false} data-critical-icon={icon} sx={{ color: 'primary.main' }} />
          <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>{icon}</Typography>
        </Box>)}
      </Box>
      <Typography variant="caption" component="p" sx={{ mt: 2 }}><Link href="/icon-attributions.txt">Icon attribution and licenses</Link></Typography>
    </Box>
  </ThemeProvider>;
}

createRoot(document.getElementById('root')).render(<Preview />);
