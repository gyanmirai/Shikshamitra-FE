import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Tooltip, IconButton } from '@mui/material';

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
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);

  const toggleLeftPanel = () => {
    setLeftPanelVisible(!leftPanelVisible);
  };

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
        <Box sx={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
          {leftPanelVisible && (
            <Box
              sx={{
                width: 280,
                flexShrink: 0,
                height: '100%',
                borderRight: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease-in-out',
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
          )}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: leftPanelVisible ? 268 : 0,
              transform: 'translateY(-50%)',
              zIndex: 10,
              transition: 'left 0.3s ease-in-out',
            }}
          >
            <Tooltip title={leftPanelVisible ? 'Collapse Categories' : 'Expand Categories'}>
              <IconButton
                onClick={toggleLeftPanel}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                size="small"
              >
                <Iconify
                  icon={
                    leftPanelVisible ? 'solar:alt-arrow-left-bold' : 'solar:alt-arrow-right-bold'
                  }
                  width={16}
                />
              </IconButton>
            </Tooltip>
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
          <Box sx={{ flexGrow: 1, height: '100%', minWidth: 0, overflow: 'auto' }}>
            <RightPanel selectedReport={selectedReport} />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
