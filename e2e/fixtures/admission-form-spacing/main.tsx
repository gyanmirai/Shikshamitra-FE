import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormSectionCard } from 'src/components/form-section-card';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Stack, Button, TextField, CssBaseline } from '@mui/material';
import { AdmissionSectionFields } from 'src/screens/student/admissions/components/admission-section-fields';

const fields = ['Student name', 'Date of birth', 'Class', 'Board', 'Medium', 'Offering'].map(
  (code) => ({ code, fieldType: 0 })
);

function Fixture() {
  const [feedback, setFeedback] = useState('empty');
  const [name, setName] = useState('');
  return (
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode={new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light'}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={2} sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
          <Stack direction="row" spacing={1}>
            {['empty', 'help', 'error', 'long'].map((mode) => (
              <Button key={mode} size="small" onClick={() => setFeedback(mode)}>{mode}</Button>
            ))}
          </Stack>
          <FormSectionCard title="Student and Admission Interest" icon="mdi:account-outline">
            <AdmissionSectionFields fields={fields} columns={2} spacing={2} renderField={(field) => (
              <Box data-field={field.code}>
                {field.code === 'Date of birth' ? (
                  <DatePicker label="Date of birth" value={null} slotProps={{ textField: { fullWidth: true, size: 'small', helperText: feedback === 'empty' ? undefined : 'Age: 4y 7m · Minimum: 6y' } }} />
                ) : field.code === 'Class' ? (
                  <CustomSelect fullWidth size="small" label="Class" value="1" onChange={() => undefined} options={[{ value: '1', label: 'Class 1' }]} />
                ) : (
                  <TextField fullWidth size="small" label={field.code} value={field.code === 'Student name' ? name : ''} onChange={(event) => field.code === 'Student name' && setName(event.target.value)} error={field.code === 'Student name' && ['error', 'long'].includes(feedback)} helperText={field.code === 'Student name' ? feedback === 'error' ? 'Student name is required.' : feedback === 'long' ? 'Preferred class must match the selected offering. Choose a matching offering or change the preferred class before continuing with this inquiry.' : undefined : undefined} />
                )}
              </Box>
            )} />
          </FormSectionCard>
        </Stack>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
