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
  'account-group-outline',
  'account-question-outline',
  'bus-school',
  'check',
  'check-circle-outline',
  'chevron-right',
  'clipboard-account-outline',
  'clipboard-text-outline',
  'close',
  'comment-quote-outline',
  'file-document-edit-outline',
  'file-document-outline',
  'file-eye-outline',
  'file-outline',
  'file-search-outline',
  'file-sign',
  'folder-check-outline',
  'format-list-bulleted',
  'form-textbox',
  'hand-coin-outline',
  'home-city-outline',
  'information-outline',
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
    selectedStarter: 'blank' as const,
    onSelect: vi.fn(),
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

    expect(screen.getByRole('button', { name: 'Start blank: Blank form' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('button', { name: 'Use recommended: Admission application' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Use inquiry form: Inquiry form' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Browse all templates/i })).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Use recommended: Admission application' })
    );
    expect(props.onSelect).toHaveBeenCalledWith('admission-application');
  });

  it('selects the inquiry form directly', async () => {
    const user = userEvent.setup();
    const props = renderChooser();

    await user.click(screen.getByRole('button', { name: 'Use inquiry form: Inquiry form' }));
    expect(props.onSelect).toHaveBeenCalledWith('admission-inquiry');
  });
});
