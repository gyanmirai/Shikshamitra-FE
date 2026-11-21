import type { PortalBook } from 'src/redux/library/library-portal-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import ShakingTextField from 'src/components/shaking-text-field';
import { Alert, Stack, Paper, Button, TextField, Typography } from '@mui/material';
import { usePortalLibrarySearchQuery } from 'src/redux/library/library-portal-api';

import PortalReserveDialog from './PortalReserveDialog';
import { portalPageSize, PortalPageStatus, PortalPageControls } from './PortalPageControls';

export default function PortalCatalogue({
  studentId,
  canReserve,
}: {
  studentId: string;
  canReserve: boolean;
}) {
  const [params, setParams] = useState({ search: '', page: 1 });
  const search = useFormik({
    initialValues: { term: '' },
    validationSchema: Yup.object({
      term: Yup.string().trim().max(100, 'Use up to 100 characters.'),
    }),
    onSubmit: ({ term }) => setParams({ search: term.trim(), page: 1 }),
  });
  const [chosen, choose] = useState<PortalBook | null>(null);
  const [saved, setSaved] = useState('');
  const query = usePortalLibrarySearchQuery(
    { studentId, pageSize: portalPageSize, ...params },
    { refetchOnMountOrArgChange: true }
  );
  const data = query.isError ? undefined : query.currentData;
  return (
    <>
      <Stack component="form" direction="row" spacing={1} onSubmit={search.handleSubmit}>
        <ShakingTextField
          error={Boolean(search.touched.term && search.errors.term)}
          sx={{ flex: 1 }}
        >
          <TextField
            name="term"
            size="small"
            label="Search titles, authors, or ISBNs"
            value={search.values.term}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 100 } }}
            onChange={search.handleChange}
            onBlur={search.handleBlur}
            error={Boolean(search.touched.term && search.errors.term)}
            helperText={search.touched.term ? search.errors.term : undefined}
          />
        </ShakingTextField>
        <Button size="small" type="submit" variant="outlined">
          Search
        </Button>
      </Stack>
      <PortalPageStatus busy={query.isFetching} error={query.isError} retry={query.refetch} />
      {saved && (
        <Alert severity="success" onClose={() => setSaved('')}>
          {saved}
        </Alert>
      )}
      {data && !data.items.length && (
        <Typography variant="body2">No books match this search.</Typography>
      )}
      {data?.items.map((book) => (
        <Paper variant="outlined" key={book.id} sx={{ p: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{book.title}</Typography>
              {book.author && <Typography variant="body2">{book.author}</Typography>}
              <Typography variant="body2" color="text.secondary">
                {book.availableCopies
                  ? `${book.availableCopies} available`
                  : 'No copies currently available'}
              </Typography>
            </Stack>
            {canReserve && (
              <Button size="small" onClick={() => choose(book)}>
                Review reservation
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
      <PortalPageControls
        data={data}
        setPage={(page) => setParams((previous) => ({ ...previous, page }))}
      />
      {chosen && (
        <PortalReserveDialog
          key={chosen.id}
          studentId={studentId}
          book={chosen}
          onClose={() => choose(null)}
          onSaved={() => {
            setSaved(
              `Reservation recorded for ${chosen.title}. Check Reservations for its status.`
            );
            choose(null);
          }}
        />
      )}
    </>
  );
}
