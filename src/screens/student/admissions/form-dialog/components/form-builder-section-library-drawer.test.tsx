import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderSectionLibraryDrawer } from './form-builder-section-library-drawer';

[
  'bus-school',
  'check-circle-outline',
  'close',
  'magnify',
  'plus',
  'account-child-outline',
  'account-school-outline',
  'file-sign',
  'folder-check-outline',
  'home-account',
  'home-map-marker',
  'medical-bag',
  'phone-alert-outline',
  'star-outline',
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

function renderDrawer() {
  const props = { onClose: vi.fn(), onAddSection: vi.fn() };
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FormBuilderSectionLibraryDrawer
        open
        targetLabel="Student details"
        onClose={props.onClose}
        onAddSection={props.onAddSection}
      />
    </ThemeProvider>
  );
  return props;
}

describe('FormBuilderSectionLibraryDrawer', () => {
  it('searches, previews, and adds a ready-made section', async () => {
    const user = userEvent.setup();
    const props = renderDrawer();

    expect(screen.getByText(/beside Student details/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Search section templates'), 'transport');
    await user.click(screen.getByRole('button', { name: /Transport requirement/i }));

    expect(screen.getByText('Service required')).toBeInTheDocument();
    expect(screen.getByText('Preferred pickup stop')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add section' }));
    expect(props.onAddSection).toHaveBeenCalledWith('transport-requirement');
    expect(props.onClose).toHaveBeenCalledOnce();
  });
});
