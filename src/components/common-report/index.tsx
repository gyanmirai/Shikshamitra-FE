import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Typography, CircularProgress } from '@mui/material';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import MiddlePanel from './MiddlePanel';

import type { ReportCategory, ReportSubCategory } from './types';

interface CommonReportProps {
  categories: ReportCategory[];
  subCategories: ReportSubCategory[];
  isLoading?: boolean;
  emptyText?: string;
}

export default function CommonReport({
  categories,
  subCategories,
  isLoading = false,
  emptyText = 'No reports available.',
}: CommonReportProps) {
  const theme = useTheme();

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const [selectedReport, setSelectedReport] = useState<ReportSubCategory | null>(null);

  useEffect(() => {
    if (!selectedCategory && categories[0]?.id) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  if (isLoading) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', minHeight: 320 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Loading reports...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', minHeight: 320 }}>
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
      <Card
        sx={{
          flexGrow: 1,
          display: 'flex',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', height: '100%', minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 220, lg: 260 },
              flexShrink: 0,
              height: '100%',
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
          >
            <LeftPanel
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => {
                setSelectedCategory(id);
                setSelectedReport(null);
              }}
            />
          </Box>
          <Box
            sx={{
              width: { xs: 280, lg: 320 },
              flexShrink: 0,
              height: '100%',
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
          >
            <MiddlePanel
              selectedCategory={selectedCategory}
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
              subCategories={subCategories}
            />
          </Box>
          <Box sx={{ flexGrow: 1, height: '100%', minWidth: 0 }}>
            <RightPanel selectedReport={selectedReport} />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
