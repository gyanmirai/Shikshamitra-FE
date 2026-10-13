import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Stack, Button, Typography } from '@mui/material';

export type StudentPopulation = 'Active' | 'Former';

type Props = {
  population: StudentPopulation;
  onApply: (population: StudentPopulation) => void;
};

export default function StudentDirectoryFilterPanel({
  population,
  onApply,
  onClose,
}: Props & { onClose: () => void }) {
  const [draft, setDraft] = useState(population);

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography id="student-directory-filter-title" variant="subtitle1">
          Filter students
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon="mdi:restore" width={16} />}
          onClick={() => setDraft('Active')}
        >
          Reset defaults
        </Button>
      </Stack>
      <CustomSelect
        label="Students"
        value={draft}
        options={[
          { value: 'Active', label: 'Active students' },
          { value: 'Former', label: 'Former students' },
        ]}
        onChange={(value) => setDraft(value === 'Former' ? 'Former' : 'Active')}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          Apply filters
        </Button>
      </Stack>
    </>
  );
}
