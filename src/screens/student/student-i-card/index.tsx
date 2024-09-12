'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useRef, useState, useEffect } from 'react';

import { ArrowBack } from '@mui/icons-material';
import { Box, Paper, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import Template2 from 'src/templates/icard/template2';
import Template1 from 'src/templates/icard/template1';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StudentICardScreen = (): JSX.Element => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');

  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setMedium(boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setMedium('');
    }
  }, [boardData, currentBoard?.id, getBoard]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

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

      {selectedTemplate === null && (
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <CustomSelect
            options={allMediums}
            label="Medium"
            value={medium}
            onChange={(val: string | string[]) => {
              setMedium(val as string);
            }}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          />
          <CustomSelect
            options={allOrganization}
            label="Organization"
            value={organization}
            onChange={(val: string | string[]) => setOrganization(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            disabled={!medium}
          />
          <CustomSelect
            options={allClass}
            label="Class"
            value={classes}
            onChange={(val: string | string[]) => setClass(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            disabled={!organization}
          />
        </Box>
      )}

      {classes &&
        (selectedTemplate === null ? (
          <Box flexGrow={1} display="flex" gap={2} flexWrap="wrap">
            <Paper
              sx={{
                height: 'max-content',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 'var(--shadows-4)',
                },
              }}
              onClick={() => handelClick(1)}
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
        ))}
    </Box>
  );
};
export default StudentICardScreen;
