'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Drawer from '@mui/material/Drawer';
import { Box, Button, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import StepPreview from './steps/StepPreview';
import type { QuestionPaperMetadata, SectionPattern } from '../types';

interface QuestionPaperPreviewDrawerProps {
  open: boolean;
  paper: QuestionPaperMetadata | null;
  printHtml?: string;
  sections: SectionPattern[];
  isLoading?: boolean;
  onClose: () => void;
}

export default function QuestionPaperPreviewDrawer({
  open,
  paper,
  printHtml,
  sections,
  isLoading = false,
  onClose,
}: QuestionPaperPreviewDrawerProps) {
  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: paper?.paperTitle || 'Question_Paper',
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '92vw', md: '78vw', lg: '70vw' },
          maxWidth: 1180,
          height: '100dvh',
          maxHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={onClose} aria-label="Close preview">
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Box
          ref={printRef}
          sx={{
            p: { xs: 1.5, md: 3 },
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StepPreview
            paper={paper}
            sections={sections}
            printHtml={printHtml}
            isLoading={isLoading}
            fullHeight
            previewActions={<></>}
          />
        </Box>
      </Scrollbar>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          disabled={isLoading || !printHtml}
          onClick={() => handlePrint()}
          startIcon={<Iconify icon="mdi:printer-outline" />}
        >
          Print / Download PDF
        </Button>
      </Box>
    </Drawer>
  );
}
