import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RoomSwitcher from './RoomSwitcher';

describe('RoomSwitcher', () => {
  it('keeps the visible room summary as the accessible control name', () => {
    const onSwitch = vi.fn();
    render(
      <RoomSwitcher
        rooms={[{ roomId: 'room-1', roomName: 'Room 101', occupied: 24, usable: 30 }]}
        activeRoomId="room-1"
        onSwitch={onSwitch}
      />
    );

    const roomButton = screen.getByRole('button', { name: 'Room 101 — 24/30' });
    fireEvent.click(roomButton);

    expect(onSwitch).toHaveBeenCalledWith('room-1');
  });
});
