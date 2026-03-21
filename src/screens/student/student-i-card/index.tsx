'use client';

import type { JSX } from 'react';
import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import IcardTemplate from 'src/templates/icard';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { Add, ArrowBack } from '@mui/icons-material';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import React, { useRef, useState, useEffect } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import ThreeDotsActions from 'src/components/three-dots-actions';
import StudentIDCardCreator from 'src/components/icard-creation';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Button, MenuList, MenuItem, IconButton, Typography } from '@mui/material';

import IcardPreview from './icard-preview';

const StudentIcardScreen = () => {
  const dialog = useBoolean();
  const previewDialog = useBoolean();

  const [cardDimensions] = useState();

  const [cardBackgroundColor] = useState();
  const [cardBackground] = useState();
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Student I-Card"
        description="Create and manage student I-cards."
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Student Record', href: '/student/dashboard' },
          { name: 'Student I-Card' },
        ]}
        action={
          <Button onClick={dialog.onTrue} startIcon={<Add />} variant="contained">
            Create I-card
          </Button>
        }
      />
      <CustomizableTable
        tableTitle="Student I-Card"
        tableId="student-icard"
        columns={[
          { label: 'Class', id: 'class' },
          {
            label: 'Status',
            id: 'status',
            render(value, row) {
              return <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>;
            },
          },
          {
            label: 'Action',
            id: 'action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={() => (
                    <MenuList>
                      <MenuItem onClick={previewDialog.onTrue}>
                        <Iconify icon="mdi:eye" />
                        Preview
                      </MenuItem>
                      <MenuItem onClick={dialog.onTrue}>
                        <Iconify icon="mdi:pencil" />
                        Edit
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:content-copy" />
                        Copy Template
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:content-paste" />
                        Paste Template
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          { class: 'Class 1', status: 'Pending' },
          { class: 'Class 2', status: 'Completed' },
          { class: 'Class 3', status: 'Pending' },
          { class: 'Class 4', status: 'Completed' },
          { class: 'Class 5', status: 'Pending' },
        ]}
      />
      <CustomDialog fullScreen title="I-card" open={dialog.value} handleClose={dialog.onFalse}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <StudentICardForm handleClose={dialog.onFalse} />
        </Scrollbar>
      </CustomDialog>
      <CustomDialog
        maxWidth="lg"
        title="Preview"
        open={previewDialog.value}
        handleClose={previewDialog.onFalse}
      >
        <IcardPreview
          cardDimensions={cardDimensions}
          cardBackgroundColor={cardBackgroundColor}
          cardBackground={cardBackground}
          fields={[]}
        />
      </CustomDialog>
    </Box>
  );
};

export default StudentIcardScreen;

const StudentICardForm = ({ handleClose }: { handleClose: () => void }): JSX.Element => {
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string[]>([]);

  const isCustom = useBoolean();

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization('all');
  }, [medium]);

  useEffect(() => {
    setAllClass(allOrganization.find((i) => i.id === organization)?.standards || []);
  }, [allOrganization, organization]);

  const handleSave = (data: Record<string, any>) => {
    Template.current = null;
    setSelectedTemplate(null);
    handleClose();
  };

  return (
    <Box>
      {selectedTemplate === null && (
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <CustomSelect
            options={[{ name: 'All', id: 'all' }, ...allOrganization]}
            label="Organization"
            value={organization}
            onChange={(val) => setOrganization(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            disabled={!medium}
          />
          {organization !== 'all' && (
            <CustomSelect
              options={allClass}
              label="Class"
              // @ts-ignore
              value={classes}
              multiple
              onChange={(val) => setClass(val as string[])}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!organization}
            />
          )}
          {!isCustom.value && (
            <Button variant="contained" onClick={isCustom.onTrue}>
              Create Custom I-card
            </Button>
          )}
        </Box>
      )}

      {isCustom.value ? (
        <StudentIDCardCreator />
      ) : (
        (classes.length || organization === 'all') &&
        (selectedTemplate === null ? (
          <>
            <Typography variant="h6" mb={2}>
              Choose Template
            </Typography>
            <Box flexGrow={1} display="flex" gap={2} flexWrap="wrap">
              {Object.values(IcardTemplate).map((CurrentTemplate, index) => {
                const Comp = CurrentTemplate.default;
                return (
                  <Paper
                    sx={{
                      height: 'max-content',
                      borderRadius: 2,
                      '&:hover': {
                        boxShadow: 'var(--shadows-4)',
                      },
                    }}
                    onClick={() => handelClick(index + 1)}
                  >
                    <Comp isShowSettings={false} />
                  </Paper>
                );
              })}
            </Box>
          </>
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
                <Template.current isShowSettings onSave={handleSave} />
              </>
            )}
          </>
        ))
      )}
    </Box>
  );
};
