import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetSubstitutionsQuery,
  useGetMySubstitutionDutiesQuery,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { DutyActionDialog } from './DutyActionDialog';
import { TeacherDutyActions } from './TeacherDutyActions';
import { dutyQuery, toDutyRow } from './duty-action-test-data';
import { useTeacherDutyActions } from '../hooks/use-teacher-duty-actions';
import { useAcknowledgeSubstitutionAction } from '../substitutionManagement.hooks';

export function renderDutyActions() {
  let controller: ReturnType<typeof useTeacherDutyActions>;
  let boardAction: ReturnType<typeof useAcknowledgeSubstitutionAction>[0];
  function Fixture() {
    const [acknowledge, { isLoading, originalArgs }] = useAcknowledgeSubstitutionAction();
    boardAction = acknowledge;
    controller = useTeacherDutyActions(
      isLoading && originalArgs ? { id: originalArgs.id, action: 'accept' } : null
    );
    const { data } = useGetMySubstitutionDutiesQuery(dutyQuery);
    useGetSubstitutionsQuery(dutyQuery);
    return (
      <>
        {data?.items.map((item) => (
          <section aria-label={item.id} key={item.id}>
            <TeacherDutyActions
              item={toDutyRow(item)}
              pendingAction={controller.pendingAction}
              onAction={controller.open}
            />
          </section>
        ))}
        <DutyActionDialog controller={controller} />
      </>
    );
  }
  const store = configureStore({
    reducer: { confirmPopup: confirmPopupReducer, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Fixture />
      </ThemeProvider>
    </Provider>
  );
  return { ...view, store, getController: () => controller, getBoardAction: () => boardAction };
}
