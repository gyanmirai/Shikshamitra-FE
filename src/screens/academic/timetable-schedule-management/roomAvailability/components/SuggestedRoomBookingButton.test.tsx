import { it, vi, expect, describe } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';

import { SuggestedRoomBookingButton } from './SuggestedRoomBookingButton';

describe('SuggestedRoomBookingButton', () => {
  it('shows booking progress only on the room that initiated the request', () => {
    renderWithProviders(
      <>
        <SuggestedRoomBookingButton
          roomId="room-a001"
          roomName="A001"
          bookingRoomId="room-a001"
          isCritical={false}
          isWarning={false}
          onBook={vi.fn()}
        />
        <SuggestedRoomBookingButton
          roomId="room-a003"
          roomName="A003"
          bookingRoomId="room-a001"
          isCritical={false}
          isWarning={false}
          onBook={vi.fn()}
        />
      </>
    );

    const bookingButton = screen.getByRole('button', { name: 'Booking A001' });
    const otherRoomButton = screen.getByRole('button', { name: 'Book Instantly: A003' });

    expect(within(bookingButton).getByRole('progressbar')).toBeInTheDocument();
    expect(within(otherRoomButton).queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
