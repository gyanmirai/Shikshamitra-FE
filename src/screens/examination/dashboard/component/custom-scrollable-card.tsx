import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

// Styled component for scrollable content with a visible scrollbar
const ScrollableContent = styled(Box)(({ theme }) => ({
  maxHeight: '150px', // Restrict the content height to trigger scrolling
  overflowY: 'auto', // Enable vertical scrolling
  paddingRight: theme.spacing(1), // Add padding for better spacing

  // Custom scrollbar styles
  '&::-webkit-scrollbar': {
    width: '8px', // Make the scrollbar wider for visibility
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.vars.palette.grey[400], // Scrollbar thumb color
    borderRadius: '4px', // Rounded corners for the scrollbar
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.vars.palette.grey[200], // Scrollbar track color
  },
}));

interface ScrollableCardProps {
  title: string;
  content: string[]; // List of content
  showFilter: boolean;
  filterOptions?: { key: string; value: string }[]; // Options for the filter dropdown
  filterValue?: string; // Selected value for the filter
  onFilterChange?: (value: string) => void; // Handler for filter change
  fontSize?: string;
  filterLabel?: string;
}

const ScrollableCard: React.FC<ScrollableCardProps> = ({
  title,
  content,
  showFilter,
  filterOptions = [],
  filterValue = '',
  onFilterChange,
  fontSize = '12px',
  filterLabel = 'Class',
}) => (
  <Card sx={{ p: 3, height: '100%' }}>
    {showFilter ? (
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography component="span" variant="h6" gutterBottom>
          {title}
        </Typography>

        {/* CustomSelect for the filter dropdown */}
        <CustomSelect
          label={filterLabel}
          options={filterOptions}
          value={filterValue}
          onChange={(event) => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
      </Box>
    ) : (
      <Typography component="span" variant="h6" gutterBottom>
        {title}
      </Typography>
    )}
    <Box sx={{ pb: '10px' }} />
    <ScrollableContent>
      {content.map((item, index) => (
        <Box display="flex" alignItems="flex-start" key={index}>
          <Typography sx={{ fontSize, lineHeight: '16px', pr: 1 }} gutterBottom>
            •
          </Typography>
          <Typography sx={{ fontSize }} gutterBottom>
            {item}
          </Typography>
        </Box>
      ))}
    </ScrollableContent>
  </Card>
);

export default ScrollableCard;
