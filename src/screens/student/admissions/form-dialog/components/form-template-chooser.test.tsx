import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormTemplateChooser } from './form-template-chooser';

[
  'arrow-right',
  'account-question-outline',
  'bus-school',
  'check',
  'check-circle-outline',
  'clipboard-account-outline',
  'clipboard-text-outline',
  'close',
  'comment-quote-outline',
  'file-document-edit-outline',
  'file-outline',
  'file-search-outline',
  'file-sign',
  'folder-check-outline',
  'hand-coin-outline',
  'home-city-outline',
  'magnify',
  'medical-bag',
  'school-outline',
  'view-grid-plus-outline',
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

function renderChooser() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, confirmPopup },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  const props = {
    onSelect: vi.fn(),
    onSelectSchoolForm: vi.fn().mockResolvedValue(true),
  };
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FormTemplateChooser {...props} />
      </ThemeProvider>
    </Provider>
  );
  return props;
}

describe('FormTemplateChooser', () => {
  it('shows three clear quick starts and applies the recommended template', async () => {
    const user = userEvent.setup();
    const props = renderChooser();

    expect(screen.getByText('Blank form')).toBeInTheDocument();
    expect(screen.getByText('Admission application')).toBeInTheDocument();
    expect(screen.getByText('Student registration')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Use recommended: Admission application' })
    );
    expect(props.onSelect).toHaveBeenCalledWith('admission-application');
  });

  it('searches, previews, and applies a template from the complete library', async () => {
    const user = userEvent.setup();
    const props = renderChooser();

    await user.click(screen.getByRole('button', { name: /Browse all templates/i }));
    expect(screen.getByRole('dialog', { name: 'Choose a form template' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search templates'), 'scholarship');
    await user.click(screen.getByRole('button', { name: /Scholarship or fee concession/i }));

    await user.click(screen.getByRole('button', { name: 'Use template' }));
    expect(props.onSelect).toHaveBeenCalledWith('scholarship-request');
    expect(
      screen.queryByRole('dialog', { name: 'Choose a form template' })
    ).not.toBeInTheDocument();
  });
});
