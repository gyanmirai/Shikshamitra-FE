import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Drawer,
  Divider,
  Checkbox,
  FormGroup,
  Typography,
  IconButton,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

type FilterCategory = 'eventType' | 'holidayType' | 'status';

export interface Filters {
  eventType: string[];
  holidayType: string[];
  status: string[];
}

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  handleApply: (filters: Filters) => void;
  filters: Filters;
}
const eventTypes: string[] = [
  'Meeting',
  'Sports Event',
  'Academic',
  'Workshop',
  'Cultural Event',
  'Holiday',
];
const holidayTypes: string[] = [
  'Sports Event',
  'Academic',
  'Workshop',
  'Cultural Event',
  'Holiday',
];
const statuses: string[] = ['Active', 'Upcoming', 'Completed'];
export default function FilterDialog({
  open,
  onClose,
  handleApply,
  filters: appliedFilter,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<Filters>({
    eventType: [],
    holidayType: [],
    status: [],
  });
  const handleCheckboxChange = (category: FilterCategory, value: string) => {
    setFilters((prev) => {
      const list = prev[category];
      return {
        ...prev,
        [category]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  const handleClearAll = () => {
    setFilters({
      eventType: [],
      holidayType: [],
      status: [],
    });
  };
  useEffect(() => {
    setFilters(appliedFilter);
  }, [appliedFilter]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            maxWidth: '300px',
            width: '100%',
          },
        },
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <Typography variant="h6" fontWeight={600}>
          Filters
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent sx={{ px: 2, pb: 1 }}>
        {/* Event Type */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
          Event Type
        </Typography>
        <FormGroup>
          {eventTypes.map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={filters.eventType.includes(type)}
                  onChange={() => handleCheckboxChange('eventType', type)}
                />
              }
              label={type}
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 2 }} />

        {/* Holiday Type */}
        <Typography variant="subtitle1" fontWeight={600}>
          Holiday Type
        </Typography>
        <FormGroup>
          {holidayTypes.map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={filters.holidayType.includes(type)}
                  onChange={() => handleCheckboxChange('holidayType', type)}
                />
              }
              label={type}
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 2 }} />

        {/* Status */}
        <Typography variant="subtitle1" fontWeight={600}>
          Status
        </Typography>
        <FormGroup>
          {statuses.map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={filters.status.includes(status)}
                  onChange={() => handleCheckboxChange('status', status)}
                />
              }
              label={status}
            />
          ))}
        </FormGroup>
      </DialogContent>

      {/* Footer buttons */}
      <Box display="flex" justifyContent="space-between" p={2} pt={1}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={handleClearAll}
        >
          Clear All
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
          variant="contained"
          onClick={() => handleApply(filters)}
        >
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );
}
