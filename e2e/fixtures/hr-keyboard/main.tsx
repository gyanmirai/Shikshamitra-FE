import 'simplebar-react/dist/simplebar.min.css';

import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { defaultSettings } from 'src/components/settings/config-settings';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';
import {
  Box,
  Stack,
  Alert,
  Button,
  TextField,
  Typography,
  CssBaseline,
  DialogActions,
} from '@mui/material';

const store = configureStore({ reducer: { confirmPopup } });
const theme = createTheme(defaultSettings);
const records = Array.from({ length: 13 }, (_, index) => ({
  id: `sample-${index + 1}`,
  name: `Sample staff ${String(index + 1).padStart(2, '0')}`,
  status: index % 2 ? 'Active' : 'Pending',
}));
const departments = [
  { value: 'none', label: 'Unavailable department' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'office', label: 'Office' },
];
const fetchStaff = async (_query: string, page: number) => ({
  data: records.slice((page - 1) * 2, page * 2),
  hasMore: page < 7,
});

function Fixture() {
  const { mode, setMode } = useColorScheme();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState(false);
  const [saved, setSaved] = useState(0);
  const [selected, setSelected] = useState<(typeof records)[number] | null>(null);
  const dirty = Boolean(name || department || notes);
  const navigation = useUnsavedNavigation(open && dirty, {
    push: (url) => window.history.pushState(null, '', url),
    renderConfirmation: (keepEditing, discardChanges) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        cancelText="Keep editing"
        content="Your local sample draft will be lost."
        onClose={keepEditing}
        action={
          <Button
            type="button"
            color="error"
            onClick={() => {
              setOpen(false);
              discardChanges();
            }}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });
  const close = () => navigation.requestNavigation(() => setOpen(false));
  const launch = () => {
    window.history.pushState(null, '', `?draft=${Date.now()}`);
    setName('');
    setDepartment('');
    setNotes('');
    setErrors(false);
    setOpen(true);
  };
  return (
    <Box component="main" sx={{ p: 2, maxWidth: 1440, mx: 'auto', minWidth: 0 }}>
      <Typography variant="h5" component="h1">
        HR keyboard verification
      </Typography>
      <Alert severity="info">
        Synthetic component checks. No staff data, authentication or backend writes.
      </Alert>
      <Stack direction="row" spacing={1} sx={{ my: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={launch}>
          Add sample staff
        </Button>
        <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Toggle theme</Button>
      </Stack>
      <Typography role="status">Local saves: {saved}</Typography>
      <PaginatedSearchSelect
        label="Find sample staff"
        value={selected}
        onChange={(_event, value) => setSelected(value)}
        fetchOptions={fetchStaff}
        minChars={0}
        getOptionLabel={(record) => record.name}
        isOptionEqualToValue={(left, right) => left.id === right.id}
        fullWidth
        size="small"
      />
      <Box sx={{ mt: 2, minWidth: 0 }}>
        <CustomizableTable
          tableId="hr-keyboard-fixture"
          tableTitle="Sample staff"
          data={records}
          defaultRowsPerPage={5}
          rowsPerPageOptions={[5, 10]}
          showColumns
          showFullScreen
          columns={[
            {
              id: 'name',
              label: 'Staff name',
              isFilter: true,
              filterType: 'string',
              minWidth: 220,
              render: (value) => (
                <Button onClick={launch} aria-label={`Edit ${value}`}>
                  {value}
                </Button>
              ),
            },
            {
              id: 'status',
              label: 'Status',
              isFilter: true,
              filterType: 'enum',
              enumOptions: [
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending' },
              ],
            },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              isFilter: false,
              render: (_value, row) => (
                <AdaptiveThreeDotsActions
                  moreLabel={`Actions for ${row.name}`}
                  directActionLimit={0}
                  actions={[
                    {
                      id: 'edit',
                      label: `Edit ${row.name}`,
                      icon: 'solar:pen-bold',
                      onClick: launch,
                    },
                    {
                      id: 'disabled',
                      label: 'Unavailable action',
                      icon: 'solar:lock-bold',
                      disabled: true,
                    },
                    {
                      id: 'review',
                      label: 'Review sample',
                      icon: 'solar:eye-bold',
                      onClick: launch,
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Box>
      <Button onClick={() => window.history.back()}>Browser back</Button>
      <CustomDialog
        open={open}
        title="Edit Sample Staff"
        titleInfo="Local draft only"
        guardUnsavedChanges={false}
        handleClose={close}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            if (!name || !department) {
              setErrors(true);
              focusFirstFormikError({
                ...(!name && { name: 'Required' }),
                ...(!department && { department: 'Required' }),
              });
              return;
            }
            setSaved((count) => count + 1);
            setOpen(false);
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <TextField
              label="Staff name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors && !name}
              helperText={errors && !name ? 'Enter a staff name' : undefined}
              size="small"
            />
            <CustomSelect
              name="department"
              label="Department"
              isSearch
              options={departments}
              disabledValues={['none']}
              value={department}
              onChange={(value) => setDepartment(String(value))}
              error={errors && !department}
              helperText={errors && !department ? 'Choose a department' : undefined}
            />
            <TextField
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              size="small"
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button type="button" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Submit sample
          </Button>
        </DialogActions>
      </CustomDialog>
      {navigation.confirmation}
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={theme} defaultMode="light" modeStorageKey="hr-keyboard-mode">
      <LocalizationProvider>
        <CssBaseline />
        <Fixture />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
