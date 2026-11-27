import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { StudentICardDesigner } from './student-icard-designer';
import { createStudentICardTemplate } from '../student-icard-design';

const signatures = vi.hoisted(() => ({
  school: {
    mode: 1,
    assetId: 'school-signature',
    principalName: 'Asha Patel',
    designation: 'Principal',
  },
  saved: {
    mode: 1,
    assetId: 'saved-signature',
    principalName: 'Kiran Shah',
    designation: 'Principal',
  },
  schoolImage: new Blob(['school']),
  savedImage: new Blob(['saved']),
  loadAsset: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/custom-tabs', async () => {
  const { default: Tabs } = await import('@mui/material/Tabs');
  return {
    CustomTabs: ({ guardUnsavedChanges, ...props }: Record<string, unknown>) => <Tabs {...props} />,
  };
});
vi.mock('src/redux/InstituteSetup/schoolIdentityApi', () => ({
  useGetSchoolIdentityQuery: () => ({
    currentData: {
      canManage: false,
      effective: {
        signature: { selection: signatures.school, asset: { id: signatures.school.assetId } },
      },
    },
  }),
  useGetSchoolIdentityAssetQuery: (params: { id: string }, options?: { skip: boolean }) => {
    if (!options?.skip) signatures.loadAsset(params);
    return {
      currentData: options?.skip
        ? undefined
        : params.id === signatures.saved.assetId
          ? signatures.savedImage
          : signatures.schoolImage,
    };
  },
  useUploadSchoolIdentityAssetMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdTemplatesQuery: () => ({
    currentData: [{ name: 'Middle school', signature: signatures.saved }],
  }),
}));
vi.mock('src/components/institute-field-formatting/use-institute-field-preview', () => ({
  useInstituteFieldPreview: () => undefined,
}));

function Fixture({ onChange }: { onChange: (patch: Partial<IdCardTemplate>) => void }) {
  const [template, setTemplate] = useState(createStudentICardTemplate);
  return (
    <StudentICardDesigner
      template={template}
      onChange={(patch) => {
        onChange(patch);
        setTemplate((previous) => ({ ...previous, ...patch }));
      }}
    />
  );
}

function renderDesigner(withSignaturePermission: boolean) {
  const store = configureStore({
    reducer: {
      confirmPopup: () => ({ isChanges: false }),
      auth: () => ({
        permissionsInitialized: true,
        permissions: [
          { name: 'InstituteSetup.SchoolIdentity.View', isGranted: true },
          {
            name: 'InstituteSetup.SchoolIdentity.AccessSignature',
            isGranted: withSignaturePermission,
          },
        ],
      }),
    },
  });
  const onChange = vi.fn();
  render(
    <Provider store={store}>
      <Fixture onChange={onChange} />
    </Provider>
  );
  return onChange;
}

afterEach(() => {
  vi.restoreAllMocks();
  signatures.loadAsset.mockClear();
});

it('uses an authorized saved signature selected in Elements for the template and preview', () => {
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) =>
    blob === signatures.savedImage ? 'blob:saved-signature' : 'blob:school-signature'
  );
  const onChange = renderDesigner(true);

  fireEvent.click(screen.getByRole('button', { name: /add signature to/i }));
  const elements = screen.getByRole('tabpanel', { name: 'Elements' });
  const select = within(elements).getByRole('combobox', { name: /principal.s signature setting/i });
  expect(select).toHaveTextContent('Use School Identity');
  fireEvent.mouseDown(select);
  expect(screen.getByRole('option', { name: /Asha Patel/ })).toBeVisible();
  fireEvent.click(screen.getByRole('option', { name: /Kiran Shah/ }));

  expect(onChange).toHaveBeenLastCalledWith({ signature: signatures.saved });
  expect(signatures.loadAsset).toHaveBeenCalledWith({ id: signatures.saved.assetId });
  expect(
    within(screen.getByRole('region', { name: 'Card preview' })).getByAltText(
      'Principal’s signature'
    )
  ).toHaveAttribute('src', 'blob:saved-signature');

  fireEvent.click(screen.getByRole('tab', { name: 'School' }));
  expect(
    within(screen.getByRole('tabpanel', { name: 'School' })).getByRole('combobox', {
      name: /principal.s signature setting/i,
    })
  ).toHaveTextContent('Kiran Shah');
});

it('keeps the protected choices and signature assets unavailable without signature permission', () => {
  renderDesigner(false);

  expect(
    screen.queryByRole('combobox', { name: /principal.s signature setting/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /add signature to/i })).not.toBeInTheDocument();
  expect(signatures.loadAsset).not.toHaveBeenCalled();
});
