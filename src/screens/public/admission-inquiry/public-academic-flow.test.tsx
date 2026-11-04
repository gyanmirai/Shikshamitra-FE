import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PublicAdmissionInquiryScreen from './index';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), success: vi.fn(), dismiss: vi.fn() },
}));

const offering = {
  id: 'offer',
  name: 'General',
  code: 'GEN',
  boardId: 'board',
  boardName: 'CBSE',
  mediumId: 'medium',
  mediumName: 'English',
  standardId: 'class',
  standardName: 'Class 4',
  canCreateInquiry: true,
};
const option = (value: string, label: string) =>
  JSON.stringify([{ value, label, isActive: true, displayOrder: 0 }]);
const academic = [
  {
    code: 'SCHOOL_BOARD_2',
    label: 'Study board',
    optionsSourceJson: '{"source":"EducationBoards"}',
    optionsJson: option('board', 'CBSE'),
  },
  {
    code: 'SCHOOL_MEDIUM_2',
    label: 'Study medium',
    optionsSourceJson: '{"source":"EducationMediums","parentField":"SCHOOL_BOARD_2"}',
    optionsJson: option('medium', 'English'),
  },
  {
    code: 'SCHOOL_CLASS_2',
    label: 'Study class',
    optionsSourceJson: '{"source":"StandardsByMedium","parentField":"SCHOOL_MEDIUM_2"}',
    optionsJson: option('class', 'Class 4'),
  },
].map((field, displayOrder) => ({
  ...field,
  fieldType: 6,
  displayOrder,
  required: false,
  readOnly: false,
  bindingType: 1,
}));
const core = [
  { code: 'CHILD', label: 'Student name', bindingKey: 'Applicant.Name', fieldType: 0 },
  { code: 'PARENT', label: 'Parent name', bindingKey: 'Guardian.FirstName', fieldType: 0 },
  { code: 'PHONE', label: 'Parent phone', bindingKey: 'Guardian.Mobile', fieldType: 0 },
  { code: 'EMAIL', label: 'Parent email', bindingKey: 'Guardian.Email', fieldType: 3 },
].map((field, displayOrder) => ({
  ...field,
  required: true,
  readOnly: false,
  displayOrder,
  bindingType: 0,
}));

async function select(name: string, label: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name }));
  fireEvent.click(await screen.findByRole('option', { name: label }));
}
function setAdmissionContext(name: string, value: string) {
  const input = screen
    .getByRole('combobox', { name })
    .parentElement?.querySelector<HTMLInputElement>('input');
  if (!input) throw new Error(`Missing ${name} select input.`);
  // The outer menus have their own interaction suite. Establish context through
  // Select's real autofill handler while these tests exercise the inner menus.
  fireEvent.change(input, { target: { value } });
}
async function open(fields = academic) {
  const context = {
    offerings: [offering],
    academicOptions: [offering],
    source: 0,
    admissionCycleName: '2026-27',
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => ({
      ok: true,
      json: async () =>
        init?.method === 'POST'
          ? {}
          : url.includes('?offeringId=')
            ? {
                ...context,
                form: {
                  id: 'form',
                  name: 'Inquiry details',
                  version: 1,
                  sections: [{ code: 'DETAILS', name: 'Details', fields: [...core, ...fields] }],
                },
              }
            : context,
    }))
  );
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PublicAdmissionInquiryScreen token="token" />
    </ThemeProvider>
  );
  await screen.findByRole('combobox', { name: 'Board' });
  setAdmissionContext('Board', 'board');
  setAdmissionContext('Medium', 'medium');
  setAdmissionContext('Class', 'class');
  await screen.findByRole('textbox', { name: 'Parent email' });
}
function fillCore(email = 'parent@example.com') {
  [
    ['Student name', 'Riya'],
    ['Parent name', 'Meera'],
    ['Parent phone', '9876543210'],
    ['Parent email', email],
  ].forEach(([name, value]) =>
    fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } })
  );
  fireEvent.click(screen.getByRole('checkbox'));
}
const posts = () => vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === 'POST');
afterEach(() => vi.unstubAllGlobals());

it('keeps resolved public selectors disabled until their parents are selected and clears descendants on parent changes', async () => {
  await open();
  expect(screen.getByRole('combobox', { name: 'Study medium' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByRole('combobox', { name: 'Study class' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await select('Study board', 'CBSE');
  await select('Study medium', 'English');
  await select('Study class', 'Class 4');
  await select('Study medium', 'None');
  expect(screen.getByRole('combobox', { name: 'Study class' }).parentElement?.querySelector('input[name="SCHOOL_CLASS_2"]')).toHaveValue('');
  expect(screen.getByRole('combobox', { name: 'Study class' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await select('Study medium', 'English');
  await select('Study class', 'Class 4');
  await select('Study board', 'None');
  expect(screen.getByRole('combobox', { name: 'Study medium' })).not.toHaveTextContent('English');
  expect(screen.getByRole('combobox', { name: 'Study class' })).not.toHaveTextContent('Class 4');
});

it('submits exact public parent and class IDs without protected reads', async () => {
  await open();
  await select('Study board', 'CBSE');
  await select('Study medium', 'English');
  await select('Study class', 'Class 4');
  fillCore();
  fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
  await waitFor(() => expect(posts()).toHaveLength(1));
  expect(JSON.parse(String(posts()[0][1]?.body)).formValues).toEqual(
    expect.arrayContaining([
      { fieldCode: 'SCHOOL_BOARD_2', valueJson: '"board"' },
      { fieldCode: 'SCHOOL_MEDIUM_2', valueJson: '"medium"' },
      { fieldCode: 'SCHOOL_CLASS_2', valueJson: '"class"' },
    ])
  );
  expect(
    vi
      .mocked(fetch)
      .mock.calls.every(([url]) => String(url).includes('/public/admission-inquiries/'))
  ).toBe(true);
});

it('rejects a restored selected child without its configured parent before public submission', async () => {
  await open(
    academic.map((field) => ({
      ...field,
      defaultValue: field.code === 'SCHOOL_CLASS_2' ? 'class' : '',
    }))
  );
  fillCore();
  fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
  await screen.findByText('Select Study medium first.');
  expect(posts()).toHaveLength(0);
});

it('focuses the required Parent email after a failed public submission', async () => {
  await open();
  fillCore('');
  fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
  await screen.findByText('Parent email is required.');
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Parent email' })).toHaveFocus());
  expect(posts()).toHaveLength(0);
});
