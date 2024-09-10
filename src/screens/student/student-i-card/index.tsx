'use client';

import React, { useRef, useState } from 'react';

import { ArrowBack } from '@mui/icons-material';
import { Box, Paper, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import Template2 from 'src/templates/icard/template2';
import Template1 from 'src/templates/icard/template1';

import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StudentICardScreen = (): JSX.Element => {
  const [selectedTemplate, setSelectedTemplate] = useState<null | number>(null);
  const isLoading = useBoolean();
  const Template = useRef<any>(null);

  const handelClick = async (template: number) => {
    setSelectedTemplate(template);
    isLoading.onTrue();
    const temp = await import(`src/templates/icard/template${template}.tsx`);
    const currentTemplate = temp.default;
    Template.current = currentTemplate;
    isLoading.onFalse();
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student ICard"
        links={[{ name: 'Student' }, { name: 'Student Record' }, { name: 'Student ICard' }]}
        sx={{ px: 1, mb: 2 }}
      />

      {selectedTemplate === null ? (
        <Box flexGrow={1} display="flex" gap={2} flexWrap="wrap">
          <Paper
            sx={{
              height: 'max-content',
              borderRadius: 2,
              '&:hover': {
                boxShadow: 'var(--shadows-4)',
              },
            }}
            onClick={() => handelClick(2)}
          >
            <Template1 isShowSettings={false} />
          </Paper>
          <Paper
            sx={{
              height: 'max-content',
              borderRadius: 2,
              '&:hover': {
                boxShadow: 'var(--shadows-6)',
              },
            }}
            onClick={() => handelClick(2)}
          >
            <Template2 isShowSettings={false} />
          </Paper>
        </Box>
      ) : (
        <>
          {isLoading.value ? (
            <LoadingScreen />
          ) : (
            <>
              <IconButton
                sx={{ mb: 1 }}
                onClick={() => {
                  Template.current = null;
                  setSelectedTemplate(null);
                }}
              >
                <ArrowBack />
              </IconButton>
              {/* eslint-disable-next-line react/jsx-pascal-case */}
              <Template.current isShowSettings />
            </>
          )}
        </>
      )}
    </Box>
  );
};
export default StudentICardScreen;
