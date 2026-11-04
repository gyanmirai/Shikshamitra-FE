import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import LockedElectiveCorrectionDialog from './LockedElectiveCorrectionDialog';

it('retains a correction draft when closing until the administrator explicitly discards it', async () => {
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer, confirmPopup }, middleware: (defaults) => defaults().concat(api.middleware) });
  const onClose = vi.fn();
  render(<Provider store={store}><LockedElectiveCorrectionDialog
    student={{ studentId: 'student', studentName: 'Student', rollNo: '1', selectedSubjectId: 'music', isLocked: true,
      selectableSubjects: [{ subjectId: 'music', subjectName: 'Music' }, { subjectId: 'art', subjectName: 'Art' }] }}
    context={{ academicMediumId: 'medium', classId: 'class', divisionId: 'division', electiveGroupId: 'group' }}
    onClose={onClose} onSaved={vi.fn()} /></Provider>);
  fireEvent.change(screen.getByLabelText('Reason (optional)'), { target: { value: 'Requested by parent' } });
  fireEvent.click(screen.getByRole('button', { name: 'close' }));
  expect(onClose).not.toHaveBeenCalled();
  await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  await waitFor(() => expect(screen.getByLabelText('Reason (optional)')).toHaveValue('Requested by parent'));
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
  expect(onClose).toHaveBeenCalledOnce();
});
