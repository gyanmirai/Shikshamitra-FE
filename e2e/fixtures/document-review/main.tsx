import 'simplebar-react/dist/simplebar.min.css';

import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { setPermissions } from 'src/redux/auth/authSlice';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  documentSummary,
  documentEvidence,
  createDocumentTestStore,
} from 'src/redux/student/admissions/document-test-fixture';
import { ApplicationDocumentsPanel } from 'src/screens/student/admissions/document-verification/application-documents-panel';
import { Box, Stack, Button, Drawer, Typography, CssBaseline } from '@mui/material';

// Only this throwaway local fixture intercepts fetch. Production components keep their real API,
// Redux, permission, upload, protected-preview and concurrency code. No real backend is contacted.
let summary = structuredClone(documentSummary);
summary.requirements = [
  {
    ...summary.requirements[0],
    status: 'pendingReview',
    canAccept: true,
    canReview: true,
    canWaive: false,
    allowedExtensions: ['png', 'pdf'],
    evidence: [
      {
        ...documentEvidence,
        fileName: 'synthetic-birth-certificate.png',
        contentType: 'image/png',
      },
    ],
  },
  {
    ...summary.requirements[0],
    code: 'ADDRESS_PROOF',
    name: 'Address proof',
    requirement: 'optional',
    isRequired: false,
    canWaive: false,
  },
];
const reviews: unknown[] = [];
const uploads: string[] = [];

async function syntheticDocument() {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fffdf7';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#888';
  context.lineWidth = 3;
  context.strokeRect(40, 40, 820, 1120);
  context.fillStyle = '#333';
  context.textAlign = 'center';
  context.font = 'bold 34px sans-serif';
  context.fillText('BIRTH CERTIFICATE', 450, 150);
  context.font = '22px sans-serif';
  context.fillText('SYNTHETIC LAYOUT TEST DOCUMENT', 450, 205);
  context.textAlign = 'left';
  context.fillText('Applicant: Synthetic student', 100, 330);
  context.fillText('Date of birth: Sample value', 100, 410);
  context.fillText('Document version: 1', 100, 490);
  context.fillText('No real identity or personal data', 100, 650);
  context.fillText('Used only for preview and zoom checks', 100, 700);
  return new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
}
const image = syntheticDocument();
const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const request = new Request(input, init);
  const path = new URL(request.url).pathname;
  if (path === '/api/auth/session') return Response.json(null);
  if (!path.startsWith('/api/student/enrollment/admissions/document-verification')) {
    if (path.startsWith('/api/'))
      return Response.json({ detail: 'Fixture route unavailable' }, { status: 404 });
    return nativeFetch(input, init);
  }
  if (path.endsWith('/download'))
    return new Response(await image, { headers: { 'Content-Type': 'image/png' } });
  if (request.method === 'GET') return Response.json(summary);
  if (path.endsWith('/review')) {
    const body = await request.json();
    reviews.push(body);
    summary.requirements[0].status = body.decision;
    summary.requirements[0].evidence[0].status = body.decision;
    summary.requirements[0].canAccept = false;
    summary.requirements[0].canReview = false;
    window.dispatchEvent(new Event('fixture-document-command'));
    return Response.json(summary);
  }
  if (path.endsWith('/upload')) {
    const body = await request.formData();
    uploads.push((body.get('file') as File).name);
    window.dispatchEvent(new Event('fixture-document-command'));
    return Response.json(summary);
  }
  return Response.json({ detail: 'Fixture command unavailable' }, { status: 400 });
};

const store = createDocumentTestStore();
store.dispatch(
  setPermissions(
    ['View', 'Add'].map((action) => ({
      name: `Students.Admissions.Documents.${action}`,
      isGranted: true,
    }))
  )
);

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      Change theme
    </Button>
  );
}

function Fixture() {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('fixture-document-command', update);
    return () => window.removeEventListener('fixture-document-command', update);
  }, []);
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
        <CssBaseline />
        <Drawer
          open
          anchor="right"
          slotProps={{
            paper: {
              sx: {
                width: { xs: '100%', lg: '92vw' },
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              },
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
            gap={1}
            sx={{ p: 2, flexShrink: 0 }}
          >
            <Typography variant="subtitle2" sx={{ mr: 'auto' }}>
              Synthetic applicant · Document layout test
            </Typography>
            <ThemeToggle />
          </Stack>
          <Box
            sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <ApplicationDocumentsPanel
              applicationId="application-1"
              stage={{
                id: 'stage-documents',
                definitionStageId: 'definition-documents',
                name: 'Document Verification',
                code: 'DOCUMENTS',
                stageType: 1,
                documentVerificationEnabled: true,
                status: 1,
                displayOrder: 0,
                allowManualSkip: false,
              }}
              layout="table"
              showCompletionAction={false}
            />
          </Box>
          <Stack component="footer" sx={{ p: 1, flexShrink: 0 }}>
            <Typography variant="caption" component="output" aria-label="Review requests">
              {JSON.stringify(reviews)}
            </Typography>
            <Typography variant="caption" component="output" aria-label="Uploaded files">
              {uploads.join(', ') || 'None'}
            </Typography>
          </Stack>
        </Drawer>
      </ThemeProvider>
    </Provider>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
