import { vi } from 'vitest';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { useBoolean } from 'src/hooks/use-boolean';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer, { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { AcademicLanguageTypingProvider } from 'src/screens/academic/components/language-typing/AcademicLanguageTypingContext';

import { SUBJECT_ICONS } from './type';
import SettingSubjectForm from './subjectForm';

[
  ...Object.values(GlobalIcons),
  ...SUBJECT_ICONS.map((icon) => icon.icon),
  'mdi:translate',
  'mdi:book-open-page-variant-outline',
].forEach((icon) => addIcon(icon, { body: '<path />' }));

export function renderSubjectForm() {
  const onClose = vi.fn();
  const store = configureStore({
    reducer: {
      globalState: () => ({ currentMedium: { id: 'medium-1' } }),
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  function Harness() {
    const open = useBoolean(true);
    const [closed, setClosed] = useState(false);
    return closed ? (
      <span>Subject form closed</span>
    ) : (
      <SettingSubjectForm
        open={open}
        onClose={(...args) => {
          onClose(...args);
          store.dispatch(setIsChanges(false));
          setClosed(true);
        }}
      />
    );
  }
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AcademicLanguageTypingProvider>
          <Harness />
        </AcademicLanguageTypingProvider>
      </ThemeProvider>
    </Provider>
  );
  return { ...view, onClose, store };
}
