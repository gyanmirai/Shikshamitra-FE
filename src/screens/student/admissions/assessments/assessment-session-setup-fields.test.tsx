import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { it, vi, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { sessionSetupInitialValues } from './assessment-session-setup-model';
import { AssessmentSessionSetupFields } from './assessment-session-setup-fields';

import type { SessionSetupValues } from './assessment-session-setup-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ children }: any) => <section>{children}</section>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, disabled, value }: any) => (
    <select
      aria-label={label}
      disabled={disabled}
      value={Array.isArray(value) ? value[0] : value}
      onChange={() => {}}
    >
      <option value={Array.isArray(value) ? value[0] : value}>{label}</option>
    </select>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, disabled }: any) => <input aria-label={label} disabled={disabled} />,
  TimePicker: ({ label, disabled }: any) => <input aria-label={label} disabled={disabled} />,
  DateTimePicker: ({ label, disabled }: any) => <input aria-label={label} disabled={disabled} />,
}));
vi.mock('src/components/custom-numeric-format', () => ({
  default: ({ label, disabled, value }: any) => (
    <input aria-label={label} disabled={disabled} value={value} onChange={() => {}} />
  ),
}));

const scopes: AssessmentScope[] = [
  {
    admissionOfferingId: 'offering',
    workflowStageDefinitionId: 'stage',
    offeringName: 'Class 1',
    className: 'Class 1',
    stageName: 'Entrance exam',
    workflowDefinitionId: 'workflow',
    workflowVersion: 3,
    schedulingEnabled: true,
  },
];
function Fields({
  identityLocked,
  roomOptions = [],
  pipeline = false,
}: {
  identityLocked: boolean;
  roomOptions?: any[];
  pipeline?: boolean;
}) {
  const formik = useFormik<SessionSetupValues>({
    initialValues: {
      ...sessionSetupInitialValues(),
      name: 'Existing session',
      offeringIds: ['offering'],
      stageIds: { offering: 'stage' },
    },
    validateOnChange: false,
    onSubmit: () => {},
  });
  return (
    <AssessmentSessionSetupFields
      formik={formik}
      scopes={scopes}
      rooms={roomOptions}
      interviewers={[]}
      bookedCount={0}
      disabled={false}
      identityLocked={identityLocked}
      pipeline={pipeline}
    />
  );
}
it('reuses room and schedule fields in Pipeline without editable class or stage selectors', () => {
  render(<Fields identityLocked={false} pipeline />);
  expect(screen.queryByRole('combobox', { name: 'Classes' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: /Select assessment/ })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Date')).toBeInTheDocument();
  expect(screen.getByLabelText('Starts at')).toBeDisabled();
  expect(screen.getByRole('combobox', { name: /Institute room/ })).toBeInTheDocument();
});
it('locks existing session identity before the first booking without disabling ordinary details', async () => {
  render(<Fields identityLocked />);
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  expect(screen.getByRole('combobox', { name: 'Assessment type' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'Classes' })).toBeDisabled();
  expect(screen.queryByRole('combobox', { name: /Select assessment/ })).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /Session name/ })).toBeEnabled();
  expect(screen.getByLabelText('Starts at')).toBeEnabled();
});
it('permits selecting type and Offering/stage identity for a new unbooked session', async () => {
  render(<Fields identityLocked={false} />);
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  expect(screen.getByRole('combobox', { name: 'Assessment type' })).toBeEnabled();
  expect(screen.getByRole('combobox', { name: 'Classes' })).toBeEnabled();
  expect(screen.queryByRole('combobox', { name: /Select assessment/ })).not.toBeInTheDocument();
});

it('refreshes rooms after resources load, searches building names and fills room capacity', async () => {
  const room = {
    id: 'r1',
    roomName: 'A002',
    buildingName: 'Main Academic Block',
    buildingId: 'b',
    floorName: 'Ground Floor',
    floorId: 'f',
    capacity: 40,
  };
  const { rerender } = render(<Fields identityLocked={false} />);
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  rerender(<Fields identityLocked={false} roomOptions={[room]} />);
  const input = screen.getByRole('combobox', { name: 'Institute room' });
  fireEvent.change(input, { target: { value: 'Main Academic' } });
  fireEvent.focus(input);
  const option = await screen.findByRole('option', { name: 'A002 Ground Floor 40 seats' });
  fireEvent.click(option);
  await waitFor(() => expect(input).toHaveValue('A002'));
  expect(screen.getByLabelText('Session capacity')).toHaveValue('40');
  expect(screen.getByText('Main Academic Block / Ground Floor')).toBeInTheDocument();
});
