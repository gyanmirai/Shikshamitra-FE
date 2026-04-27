import React from 'react';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Box, Tab, Card, Button, Typography, LinearProgress } from '@mui/material';

import type { ChapterData, ChapterTabsViewProps } from '../type';

const ChapterContent: React.FC<{ content: string }> = ({ content }) => (
  <Box sx={{ p: 2 }}>
    <Typography>{content}</Typography>
  </Box>
);

const ChapterProgressBar = ({ chapter }: { chapter: ChapterData }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      {chapter.chapter} Progress
    </Typography>
    <Box
      sx={{
        width: '200px',
        height: '24px',
        position: 'relative',
        borderRadius: '12px',
        bgcolor: '#e0e0e0',
        overflow: 'hidden',
      }}
    >
      <LinearProgress
        variant="determinate"
        value={chapter.progress}
        sx={{
          height: '100%',
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'primary',
            transition: 'transform 0.4s linear',
          },
        }}
      />
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#000',
          fontWeight: 'bold',
          zIndex: 1,
        }}
      >
        {`${Math.round(chapter.progress)}%`}
      </Typography>
    </Box>
  </Box>
);

const ChapterTabsView: React.FC<ChapterTabsViewProps> = ({ chapters }) => {
  const tabs = useTabs(chapters[0]?.id.toString());

  const CHAPTER_TABS = chapters.map((chapter) => ({
    value: chapter.id.toString(),
    label: chapter?.chapter,
    component: () => (
      <Box sx={{ marginTop: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <ChapterProgressBar chapter={chapter} />
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="contained" startIcon={<Add />} onClick={() => {}}>
              Add New Content
            </Button>
            <Button variant="contained" onClick={() => {}}>
              Edit
            </Button>
            <Button variant="contained" onClick={() => {}}>
              Delete
            </Button>
          </Box>
        </Box>
        <Card sx={{ mt: 2, height: '100%' }}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
            <ChapterContent content={chapter.content} />
          </Scrollbar>
        </Card>
      </Box>
    ),
  }));

  const CurrentComponent = CHAPTER_TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          marginTop: 2,
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {CHAPTER_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default ChapterTabsView;
