import type { LibraryCopyEvent } from 'src/redux/library/copy-events-types';

import {
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from '@mui/material';

import { copyEventChanges } from './copy-event-display';

export function CopyEventChanges({ event }: { event: LibraryCopyEvent }) {
  const changes = copyEventChanges(event);
  if (!changes.length)
    return (
      <Typography variant="body2" color="text.secondary">
        No field changes recorded.
      </Typography>
    );
  return (
    <TableContainer>
      <Table size="small" aria-label={`Recorded changes for event ${event.sequence}`}>
        <TableHead>
          <TableRow>
            <TableCell>Field</TableCell>
            <TableCell>Before</TableCell>
            <TableCell>After</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {changes.map((change) => (
            <TableRow key={change.field}>
              <TableCell component="th" scope="row">
                {change.field}
              </TableCell>
              <TableCell sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', minWidth: 140 }}>
                {change.before || 'Not set'}
              </TableCell>
              <TableCell sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', minWidth: 140 }}>
                {change.after || 'Not set'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
