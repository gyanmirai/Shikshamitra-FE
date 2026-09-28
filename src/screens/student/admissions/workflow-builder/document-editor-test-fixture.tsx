import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';

const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 5,
  displayName: 'Document verification',
  description: 'Collect and review evidence',
  icon: 'mdi:file-check-outline',
  defaultColor: '#1976d2',
  supportedConfiguration: ['documentVerification'],
  runtimeHandler: 'DocumentVerification',
  nextRequiredAction: 'Verify documents',
  canBeEntryStage: false,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};
const stage: AdmissionWorkflowStage = {
  id: 'stage-documents',
  code: 'DOCUMENTS',
  name: 'Document verification',
  stageType: 5,
  displayOrder: 2,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
};
const createEditorStore = () => configureStore({
  reducer: { confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware),
});
export function renderDocumentEditor(
  configurationJson?: string,
  readOnly = false,
  available = true
) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/student/enrollment/admissions/document-verification/document-types', () =>
      HttpResponse.json([])
    )
  );
  const store = createEditorStore();
  stores.push(store);
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionWorkflowStageDrawer
          open
          stage={{ ...stage, configurationJson }}
          forms={[]}
          stageTypes={[
            { ...metadata, supportedConfiguration: available ? ['documentVerification'] : [] },
          ]}
          readOnly={readOnly}
          onSave={onSave}
          onClose={onClose}
        />
      </ThemeProvider>
    </Provider>
  );
  fireEvent.click(screen.getByRole('tab', { name: 'Process' }));
  return { onSave, onClose, store };
}
const stores: ReturnType<typeof createEditorStore>[] = [];
afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
});
export async function chooseDocumentOption(
  user: { click: (element: Element) => Promise<unknown> },
  label: string,
  name: string
) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(screen.getByRole('option', { name }));
  await waitFor(() => expectNoListbox());
}
function expectNoListbox() {
  if (screen.queryByRole('listbox', { hidden: true }))
    throw new Error('Wait for select transition to finish');
}
