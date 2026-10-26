import { useState } from 'react';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import TextField from '@mui/material/TextField';
import { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { useInstituteFieldPreview } from './use-institute-field-preview';
import {
  renderAcademicOrder,
  createAcademicOrderStore,
} from '../academic-setup/academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createAcademicOrderStore>;
let reads = 0;
let textCase = 0;
const permission = 'ShikshaMitra.Module.InstituteSetup.RoomManagement.Room.View';

function Entry({ editing = false }: { editing?: boolean }) {
  const [value, setValue] = useState('existing mIxEd room');
  const preview = useInstituteFieldPreview('rooms', 'roomName', value, editing);
  return (
    <TextField
      label="Room name"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      helperText={preview}
    />
  );
}
beforeEach(() => {
  reads = 0;
  textCase = 0;
  store = createAcademicOrderStore();
  store.dispatch(setPermissions([{ name: permission, isGranted: true }]));
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/institute-field-formatting/rooms', () => {
      reads += 1;
      return HttpResponse.json({ fields: { roomName: textCase, featureName: 0 } });
    })
  );
});
afterEach(async () => {
  await act(async () => {
    cleanup();
    store.dispatch(api.util.resetApiState());
  });
  clearCachedAuthSession();
});

describe('new-entry formatting previews', () => {
  it('Default preserves typed case with no formatting helper', async () => {
    renderAcademicOrder(<Entry />, store);
    await waitFor(() => expect(reads).toBe(1));
    await waitFor(() =>
      expect(screen.queryByText('Loading field format…')).not.toBeInTheDocument()
    );
    const input = screen.getByLabelText('Room name');
    fireEvent.change(input, { target: { value: 'raw cBsE room' } });
    expect(input).toHaveValue('raw cBsE room');
    expect(screen.queryByText(/Will be saved as/)).not.toBeInTheDocument();
  });

  it('previews the saved mode without changing raw entry text', async () => {
    textCase = 4;
    renderAcademicOrder(<Entry />, store);
    const input = screen.getByLabelText('Room name');
    fireEvent.change(input, { target: { value: 'raw mIxEd room' } });
    await screen.findByText('Will be saved as: RAW MIXED ROOM');
    expect(input).toHaveValue('raw mIxEd room');
  });

  it('does not fetch or reformat existing values during editing', async () => {
    textCase = 4;
    renderAcademicOrder(<Entry editing />, store);
    await act(async () => {});
    expect(screen.getByLabelText('Room name')).toHaveValue('existing mIxEd room');
    expect(reads).toBe(0);
    expect(screen.queryByText(/Will be saved as/)).not.toBeInTheDocument();
  });

  it('does not fetch formatting rules without the owning View permission', async () => {
    store.dispatch(setPermissions([]));
    renderAcademicOrder(<Entry />, store);
    await act(async () => {});
    expect(reads).toBe(0);
    expect(screen.getByLabelText('Room name')).toHaveValue('existing mIxEd room');
  });

  it('keeps entry text and gives an honest fallback if settings cannot load', async () => {
    mswServer.use(
      http.get('*/api/app/institute-field-formatting/rooms', () =>
        HttpResponse.json({}, { status: 503 })
      )
    );
    renderAcademicOrder(<Entry />, store);
    await screen.findByText('School formatting will be applied when saved.');
    expect(screen.getByLabelText('Room name')).toHaveValue('existing mIxEd room');
  });
});
