import { vi, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createRoomTestWrapper } from 'src/components/timetable/room-defaults-test-fixture';

import { BasicInformationForm } from './basicInformationForm';
import { prepareRoomFormNetwork } from './RoomManagement/RoomCreateManagement/components/room-form-test-network';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('framer-motion', async () => {
  const { createElement, forwardRef } = await import('react');
  return {
    motion: {
      form: forwardRef<HTMLFormElement, Record<string, unknown>>((props, ref) => {
        const formProps = { ...props };
        delete formProps.initial;
        delete formProps.animate;
        delete formProps.transition;
        return createElement('form', { ...formProps, ref });
      }),
    },
  };
});

it('keeps the edited profile available after a failed save and closes only after a successful retry', async () => {
  prepareRoomFormNetwork();
  const onClose = vi.fn();
  let writes = 0;
  mswServer.use(
    http.put('*/api/multi-tenancy/tenants/school-a', () => {
      writes += 1;
      return writes === 1
        ? HttpResponse.json({ detail: 'School profile could not be saved.' }, { status: 500 })
        : HttpResponse.json({ id: 'school-a' });
    })
  );
  render(
    <BasicInformationForm
      handleClose={onClose}
      editData={{
        id: 'school-a',
        adminEmailAddress: 'admin@school.test',
        extraProperties: {
          InstituteName: 'Sample school',
          Address1: 'Main road',
          ContactNumber: '+919876543210',
          Country: { name: 'India', isoCode: 'IN' },
          State: { name: 'Gujarat', isoCode: 'GJ' },
          City: 'Ahmedabad',
        },
      }}
    />,
    createRoomTestWrapper()
  );
  fireEvent.change(screen.getByLabelText(/Institute Name/), {
    target: { value: 'Revised school' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Update & Next' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('School profile could not be saved.');
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/Institute Name/)).toHaveValue('Revised school');
  fireEvent.click(screen.getByRole('button', { name: 'Update & Next' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(writes).toBe(2);
});
