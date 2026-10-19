import type { HrReportField } from 'src/redux/hr/hrReportsApi';
import type { ReportColumn } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useRef } from 'react';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import DragIndicator from '@mui/icons-material/DragIndicator';
import {
  Box,
  Stack,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';

export function ReportColumnsEditor({
  columns,
  fields,
  onChange,
}: {
  columns: ReportColumn[];
  fields: HrReportField[];
  onChange: (next: ReportColumn[]) => void;
}) {
  const dragged = useRef<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= columns.length) return;
    const next = [...columns];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <Stack spacing={1.5}>
      <Autocomplete
        size="small"
        options={fields.filter((f) => !columns.some((c) => c.field === f.id))}
        value={null}
        getOptionLabel={(f) => f.label}
        onChange={(_, f) => {
          if (f) onChange([...columns, { field: f.id, label: '', format: 'auto' }]);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Add report column" placeholder="Search available fields" />
        )}
      />
      <Typography variant="caption" color="text.secondary">
        Drag to reorder, or use the move buttons. Display labels do not change source data.
      </Typography>
      {columns.map((column, index) => {
        const field = fields.find((f) => f.id === column.field);
        const update = (patch: Partial<ReportColumn>) =>
          onChange(columns.map((c, i) => (i === index ? { ...c, ...patch } : c)));
        return (
          <Box
            key={column.field}
            draggable
            onDragStart={() => {
              dragged.current = index;
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (dragged.current !== null) move(dragged.current, index);
              dragged.current = null;
            }}
            sx={{
              display: 'grid',
              alignItems: 'center',
              gap: 1,
              gridTemplateColumns: {
                xs: '1fr',
                md: '24px minmax(120px, 1fr) minmax(140px, 1fr) 150px auto',
              },
              borderBottom: 1,
              borderColor: 'divider',
              pb: 1,
            }}
          >
            <DragIndicator
              aria-hidden
              sx={{ color: 'text.disabled', display: { xs: 'none', md: 'block' } }}
            />
            <Typography variant="body2">{field?.label || column.field}</Typography>
            <TextField
              size="small"
              label={`Label for ${field?.label || column.field}`}
              placeholder={field?.label}
              value={column.label}
              onChange={(e) => update({ label: e.target.value })}
              inputProps={{ maxLength: 128 }}
            />
            <TextField
              select
              size="small"
              label="Display format"
              value={column.format}
              onChange={(e) => update({ format: e.target.value })}
            >
              <MenuItem value="auto">Automatic</MenuItem>
              <MenuItem value="text">Text</MenuItem>
              {['number', 'money'].includes(field?.type || '') && (
                <MenuItem value="number">Number</MenuItem>
              )}
              {field?.type === 'money' && <MenuItem value="money">Money</MenuItem>}
              {field?.type === 'date' && <MenuItem value="date">Date</MenuItem>}
              {field?.type === 'datetime' && <MenuItem value="datetime">Date and time</MenuItem>}
            </TextField>
            <Stack direction="row">
              <IconButton
                size="small"
                aria-label={`Move ${field?.label} up`}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowUpward fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`Move ${field?.label} down`}
                disabled={index === columns.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDownward fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`Remove ${field?.label} column`}
                onClick={() => onChange(columns.filter((_, i) => i !== index))}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
