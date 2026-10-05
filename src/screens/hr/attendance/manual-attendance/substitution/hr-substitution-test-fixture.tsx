import dayjs from 'dayjs';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { academicPermissions } from 'src/constants/academic-menu';
import { useSaveDayAttendanceMutation } from 'src/redux/hr/attendanceApi';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';

import { useHrSubstitution } from './use-hr-substitution';
import { HrSubstitutionAction } from './HrSubstitutionAction';
import { HrSubstitutionDrawer } from './HrSubstitutionDrawer';

const employee = {
  id: 'original-1',
  fullName: 'Absent Teacher',
  isTeaching: true,
  status: 'Absent',
};

export function renderHrSubstitution(dirty = true) {
  mswServer.use(
    http.get(/https:\/\/api\.(iconify\.design|simplesvg\.com|unisvg\.com)\/.*/, () =>
      HttpResponse.json({ icons: {}, not_found: [] })
    )
  );
  function Fixture() {
    const [changed, setChanged] = useState(dirty);
    const [save, { isLoading }] = useSaveDayAttendanceMutation();
    const controller = useHrSubstitution(dayjs('2026-10-05'), changed, async () => {
      try {
        await save({
          attendanceDate: '2026-10-05',
          entries: [{ employeeId: employee.id, statusWire: 'ABSENT' }],
        }).unwrap();
        setChanged(false);
        return true;
      } catch {
        return false;
      }
    });
    return (
      <>
        <HrSubstitutionAction
          employee={employee}
          dirty={changed}
          disabled={isLoading || controller.opening}
          onArrange={controller.open}
        />
        {controller.selected && (
          <HrSubstitutionDrawer
            employee={controller.selected.employee}
            date={controller.selected.date}
            onClose={controller.close}
          />
        )}
      </>
    );
  }
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissions: ['View', 'Add'].map((action) => ({
          name: `${academicPermissions.timetable.substitutionManagement}.${action}`,
          isGranted: true,
        })),
      }),
      globalState: () => ({ currentYear: { id: 'year-1' } }),
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Fixture />
      </ThemeProvider>
    </Provider>
  );
}
