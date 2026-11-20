import type { IColumn } from 'src/components/customizabaleTable/types';

import { Link } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { formatDateOnly } from 'src/utils/date-only';
import { libraryPaths } from 'src/constants/library-menus';

import { receivingSources } from './receiving-field-state';

export const receivingHistoryColumns: IColumn[] = [
  { id: 'receivedOn', label: 'Received on', render: (value: string) => formatDateOnly(value) },
  {
    id: 'source',
    label: 'Source',
    render: (value: number) =>
      receivingSources.find((source) => source.id === value)?.name || 'Unavailable',
  },
  {
    id: 'sourceName',
    label: 'Supplier or donor',
    render: (value: string | null) => value || 'Not recorded',
  },
  {
    id: 'reference',
    label: 'External reference',
    render: (value: string | null) => value || 'Not recorded',
  },
  { id: 'lineCount', label: 'Title lines' },
  { id: 'copyCount', label: 'Copies' },
  {
    id: 'recordedAt',
    label: 'Recorded at (UTC)',
    render: (value: string) => new Date(value).toLocaleString(undefined, { timeZone: 'UTC' }),
  },
  { id: 'recordedBy', label: 'Recorded by account ID', minWidth: 240 },
  {
    id: 'id',
    label: 'Receipt',
    minWidth: 180,
    render: (value: string) => (
      <Link
        component={RouterLink}
        href={`${libraryPaths.receiving}/${encodeURIComponent(value)}`}
        aria-label={`View receiving receipt ${value}`}
      >
        View receiving receipt
      </Link>
    ),
  },
].map((column) => ({ ...column, isSort: false, isFilter: false }));
