import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Stack, Button, CssBaseline, Typography } from '@mui/material';

import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import ConcessionTypeTable from 'src/screens/finance/settings/ConcessionTypeSetting/Components/ConcessionTable';
import ConcessionTypeDrawer from 'src/screens/finance/settings/ConcessionTypeSetting/Components/ConcessionTypeDrawer';
import ConcessionTypeVersionHistoryDrawer from 'src/screens/finance/settings/ConcessionTypeSetting/Components/ConcessionTypeVersionHistoryDrawer';
import type { IConcessionTypeForm } from 'src/screens/finance/settings/ConcessionTypeSetting/type';
import type { IParams } from 'src/components/customizabaleTable/types';

import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({
  reducer: {
    confirmPopup: confirmPopupReducer,
    globalState: () => ({ currentYear: { id: 'synthetic-year' } }),
  },
});

const syntheticRows: IConcessionTypeForm[] = [
  {
    id: 'synthetic-concession',
    name: 'Synthetic sibling concession',
    description: 'A concession for siblings enrolled in the same academic year.',
    isActive: true,
    isUsedInDownstream: false,
    documents: [
      {
        documentName: 'Sibling certificate',
        maxFileSizeMb: 5,
        acceptedFormats: [0, 4],
        isRequired: true,
      },
    ],
  },
  {
    id: 'long-synthetic-concession',
    name: 'Extended academic achievement and extracurricular participation concession for eligible students',
    description:
      'This deliberately long description verifies that the full concession details remain available in a tooltip while the listing keeps a compact, aligned layout.',
    isActive: true,
    isUsedInDownstream: true,
    documents: [
      {
        documentName: 'Academic achievement certificate with institution endorsement',
        maxFileSizeMb: 5,
        acceptedFormats: [4],
        isRequired: true,
      },
      {
        documentName: 'Extracurricular participation verification letter',
        maxFileSizeMb: 5,
        acceptedFormats: [4],
        isRequired: false,
      },
    ],
  },
  {
    id: 'archived-synthetic-concession',
    name: 'Archived financial assistance',
    description: 'An archived concession retained for historical requests.',
    isActive: false,
    canDelete: false,
    isUsedInDownstream: true,
    deactivationReason:
      'Replaced by the revised financial assistance scheme after the annual eligibility review; historical requests retain this concession type.',
    documents: [],
  },
];

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      Toggle preview theme
    </Button>
  );
}

function Fixture() {
  const [open, setOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<IConcessionTypeForm | null>(syntheticRows[0]);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [saved, setSaved] = React.useState('');
  const [selected, setSelected] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<IParams['filters']>([]);
  const filteredRows = syntheticRows.filter((row) =>
    `${row.name} ${row.description}`.toLowerCase().includes(search.toLowerCase())
  );
  React.useEffect(() => {
    const onSaved = (event: Event) =>
      setSaved(JSON.stringify((event as CustomEvent).detail.documents?.[0]?.acceptedFormats));
    window.addEventListener('fixture-saved', onSaved);
    return () => window.removeEventListener('fixture-saved', onSaved);
  }, []);
  const openState = {
    value: open,
    onTrue: () => setOpen(true),
    onFalse: () => setOpen(false),
    onToggle: () => setOpen((value) => !value),
  } as any;

  return (
    <Provider store={store}>
      <ThemeProvider
        theme={createTheme(defaultSettings)}
        defaultMode="light"
        modeStorageKey="concession-type-preview-mode"
      >
        <CssBaseline />
        <Box
          sx={{
            p: 1,
            height: '100dvh',
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
            sx={{ mb: 1 }}
          >
            <Typography variant="h5">Concession Type</Typography>
            <Button
              size="small"
              color="inherit"
              variant="contained"
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
            >
              Add Concession Type
            </Button>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
            <Button
              size="small"
              onClick={() => {
                setEditData(syntheticRows[0]);
                setOpen(true);
              }}
            >
              Edit existing concession
            </Button>
            <Button size="small" onClick={() => setHistoryOpen(true)}>
              View legacy version history
            </Button>
            <ThemeToggle />
          </Stack>
          {saved && <Typography role="status">Saved formats: {saved}</Typography>}
          {selected && <Typography role="status">Selected: {selected}</Typography>}
          <ConcessionTypeTable
            canView
            canAdd
            canEdit
            canChangeStatus
            canDelete
            data={filteredRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
            isLoading={false}
            addConcessionType={openState}
            setEditData={setEditData}
            onEdit={(row) => {
              setEditData(row);
              setOpen(true);
            }}
            onView={(row) => setSelected(row.name)}
            onDelete={(row) => setSelected(`Delete ${row.name}`)}
            onVersionHistory={() => setHistoryOpen(true)}
            totalCount={filteredRows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            searchTerm={search}
            filters={filters}
            onServerFilter={setFilters}
            onServerSearch={(value) => {
              setSearch(value);
              setPage(0);
            }}
            onServerPagination={(nextPage, nextSize) => {
              setPage(nextPage - 1);
              setRowsPerPage(nextSize);
            }}
          />
          <ConcessionTypeDrawer
            open={openState}
            editData={editData}
            onClose={() => setOpen(false)}
          />
          <ConcessionTypeVersionHistoryDrawer
            open={historyOpen}
            concessionTypeId="synthetic-concession"
            concessionTypeName="Synthetic sibling concession"
            onClose={() => setHistoryOpen(false)}
          />
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
