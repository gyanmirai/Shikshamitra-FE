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

function renderChooser(purpose: 0 | 1) {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, confirmPopup },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  const props = {
    purpose,
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
  it('offers only blank and application starters for registration', async () => {
    const user = userEvent.setup();
    const props = renderChooser(1);

    expect(screen.getByRole('button', { name: 'Start blank: Blank form' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('button', { name: 'Use recommended: Registration form' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use inquiry form: Inquiry form' })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Browse all templates/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Use recommended: Registration form' }));
    expect(props.onSelect).toHaveBeenCalledWith('admission-application');
  });

  it('offers only blank and inquiry starters for inquiry', async () => {
    const user = userEvent.setup();
    const props = renderChooser(0);

    expect(screen.getByRole('button', { name: 'Start blank: Blank form' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use recommended: Registration form' })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Use inquiry form: Inquiry form' }));
    expect(props.onSelect).toHaveBeenCalledWith('admission-inquiry');
  });
});
