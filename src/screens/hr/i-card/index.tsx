'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useRef, useState, useEffect } from 'react';

import { Add, ArrowBack } from '@mui/icons-material';
import { Box, Card, Button, MenuList, MenuItem, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { LoadingScreen } from 'src/components/loading-screen';
import ThreeDotsActions from 'src/components/three-dots-actions';
import StudentIDCardCreator from 'src/components/icard-creation';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IcardPreview from './icard-preview';

const StudentIcardScreen = () => {
  const dialog = useBoolean();
  const previewDialog = useBoolean();

  const [cardDimensions, setCardDimensions] = useState();

  const [cardBackgroundColor, setCardBackgroundColor] = useState();
  const [cardBackground, setCardBackground] = useState();
  return (
    <Box>
      {dialog.value ? (
        <>
          <CustomBreadcrumbs
            heading="I-Card"
            links={[{ name: 'HR' }, { name: 'Employee' }, { name: 'I-Card' }]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                onClick={dialog.onFalse}
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                variant="contained"
              >
                Back
              </Button>
            }
          />
          <Card>
            <StudentICardForm handleClose={dialog.onFalse} />
          </Card>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="I-Card"
            links={[{ name: 'HR' }, { name: 'Employee' }, { name: 'I-Card' }]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button onClick={dialog.onTrue} startIcon={<Add />} variant="contained">
                Create I-card
              </Button>
            }
          />
          <CustomizableTable
            tableId="icard-table"
            columns={[
              { label: 'Organization', id: 'organization' },
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
                      showViewIcon
                      showEditIcon
                      handleEditClick={dialog.onTrue}
                      handleViewClick={previewDialog.onTrue}
                      actions={() => (
                        <MenuList>
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
              { organization: 'Primary', status: 'Pending' },
              { organization: 'Pre Primary', status: 'Completed' },
            ]}
          />
        </>
      )}
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

  const handleSave = (data: Record<string, any>) => {
    console.log(data);
    Template.current = null;
    setSelectedTemplate(null);
    handleClose();
  };

  return (
    <Scrollbar
      sx={{
        height: '100%',
        p: 2,
        // bgcolor: 'background.neutral',
        '& .simplebar-content': { height: '100%' },
      }}
    >
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

          {!isCustom.value && (
            <Button variant="contained" onClick={isCustom.onTrue}>
              Create Custom I-card
            </Button>
          )}
        </Box>
      )}

      {isCustom.value ? (
        <StudentIDCardCreator />
      ) : selectedTemplate === null ? (
        <>
          <Typography variant="h6" mb={2}>
            Choose Template
          </Typography>
          {/* <Box flexGrow={1} display="flex" gap={2} flexWrap="wrap">
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
          </Box> */}
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
      )}
    </Scrollbar>
  );
};
