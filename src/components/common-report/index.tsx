import { useState } from 'react';
import { Box, Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import MiddlePanel from './MiddlePanel';

import type { ReportCategory, ReportSubCategory } from './types';

interface CommonReportProps {
  categories: ReportCategory[];
  subCategories: ReportSubCategory[];
}

export default function CommonReport({ categories, subCategories }: CommonReportProps) {
  const theme = useTheme();

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const [selectedReport, setSelectedReport] = useState<ReportSubCategory | null>(null);

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
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <Box
            sx={{
              width: 280,
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
              width: 320,
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
