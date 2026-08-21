'use client';

import type { EditorProps } from 'src/components/editor';

import { useState } from 'react';
import { Editor } from 'src/components/editor';
import { Box, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

import { useAcademicLanguageTyping } from './AcademicLanguageTypingContext';

export function AcademicLanguageEditor({ sx, editable = true, ...props }: EditorProps) {
  const { isSetupComplete, openSetupGuide } = useAcademicLanguageTyping();
  const [focused, setFocused] = useState(false);

  return (
    <Box
      sx={{ position: 'relative', width: '100%' }}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      <Editor editable={editable} sx={sx} {...props} />
      {editable && focused && !isSetupComplete && (
        <CustomTooltip title="Set up language typing">
          <IconButton
            size="small"
            aria-label="Set up language typing"
            onMouseDown={(event) => event.preventDefault()}
            onClick={openSetupGuide}
            sx={{
              position: 'absolute',
              right: 46,
              bottom: 8,
              zIndex: 2,
              width: 28,
              height: 28,
              color: 'primary.contrastText',
              bgcolor: 'primary.main',
              boxShadow: 2,
              animation: 'academic-language-editor-pulse 1.8s ease-in-out infinite',
              '@keyframes academic-language-editor-pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.14)' },
              },
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <Iconify icon="mdi:translate" width={17} />
          </IconButton>
        </CustomTooltip>
      )}
    </Box>
  );
}
