'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetConcessionTypesQuery } from 'src/redux/finance/concessionType';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';
import {
  Box,
  Grid,
  Card,
  Button,
  Tooltip,
  Skeleton,
  IconButton,
  Typography,
  CardContent,
  DialogActions,
} from '@mui/material';
import {
  useGetConcessionRequestByIdQuery,
  useCreateConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
} from 'src/redux/finance/ConcessionManagement/concessionRequestApi';

import { concessionValidation } from './ConcessionValidation';
import { getInitialConcessionFormData } from './ConcessionInitialValues';

import type { IConcession, IConcessionFormProps } from '../type';

const NewConcessionRequestForm: React.FC<IConcessionFormProps> = ({
  open,
  onClose,
  student,
  editData,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // state
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<any[]>([]);
  // Fetch concession type data
  const { data: concessionTypes, isLoading: isLoadingConcessionTypes } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
  });

  const [createConcessionRequest, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateConcessionRequestMutation,
  });
  const [updateConcessionRequest, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateConcessionRequestMutation,
  });

  // queries
  const [getClassByMedium, { data: classes, isLoading: classesLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  const [getStudents, { isLoading: studentsLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: concessionData = [], isLoading: isLoadingConcessionData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestByIdQuery,
    params: {
      id: editData?.id,
    },
  });
  const formik = useFormik<IConcession>({
    initialValues: getInitialConcessionFormData(editData),
    validationSchema: concessionValidation,
    onSubmit: (values) => {
      if (editData) {
        updateConcessionRequest({
          academicYearId: currentYear?.id,
          boardId: values.board,
          mediumId: values.medium,
          classId: values.className,
          divisionId: values.division,
          studentId: values.studentId,
          concessionTypeIds: values.concessionTypeIds,
          documents: values.documents,
        });
        shikshaMitraToast.success({
          message: `Concession request updated successfully`,
        });
      } else {
        createConcessionRequest({
          academicYearId: currentYear?.id,
          boardId: values.board,
          mediumId: values.medium,
          classId: values.className,
          divisionId: values.division,
          studentId: values.studentId,
          concessionTypeIds: values.concessionTypeIds,
          documents: values.documents,
        });
        shikshaMitraToast.success({
          message: `Concession request added successfully`,
        });
      }
      onClose(null, true);
    },
  });
  // load boards on year change
  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

  // load mediums when board changes
  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === formik.values.board);
    setMediums(selectedBoard?.educationMediums || []);
    if (formik.values.medium) {
      getClassByMedium(formik.values.medium);
    }
  }, [formik.values.board, formik.values.medium, boards, getClassByMedium]);

  // load divisions when class changes
  useEffect(() => {
    setAllDivision(
      classes?.find((cls: any) => cls.id === formik.values.className)?.divisions || []
    );
  }, [formik.values.className, classes]);

  // load students when class & division selected
  useEffect(() => {
    if (formik.values.className && formik.values.division) {
      getStudents({ standardId: formik.values.className, divisionId: formik.values.division });
    }
  }, [formik.values.className, formik.values.division, getStudents]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Student Information"
                  paperProps={{ sx: { ...cardStyle, mb: 0 } }}
                >
                  {/* Board */}
                  <Grid size={6}>
                    <ShakingTextField error={!!(formik.touched.board && formik.errors.board)}>
                      {!currentYear ? (
                        <Skeleton variant="rounded" height={40} />
                      ) : (
                        <CustomSelect
                          label="Board *"
                          options={(boards || []).map((b: any) => ({
                            label: b.name,
                            value: b.id,
                          }))}
                          value={formik.values.board}
                          onChange={(val: any) => {
                            formik.setFieldValue('board', val);
                            formik.setFieldTouched('board', false);
                            formik.setFieldValue('medium', '');
                            formik.setFieldValue('className', '');
                            formik.setFieldValue('division', '');
                            formik.setFieldValue('studentName', null);
                            formik.setFieldValue('studentId', '');
                          }}
                          disabled={!!editData}
                          error={!!formik.errors.board && formik.touched.board}
                          helperText={(formik.touched.board && formik.errors.board) as string}
                        />
                      )}
                    </ShakingTextField>
                  </Grid>

                  {/* Medium */}
                  <Grid size={6}>
                    <ShakingTextField error={!!(formik.touched.medium && formik.errors.medium)}>
                      {!currentYear ? (
                        <Skeleton variant="rounded" height={40} />
                      ) : (
                        <CustomSelect
                          label="Medium *"
                          options={(mediums || []).map((m: any) => ({
                            label: m.name,
                            value: m.id,
                          }))}
                          value={formik.values.medium}
                          onChange={(val: any) => {
                            formik.setFieldValue('medium', val);
                            formik.setFieldTouched('medium', false);
                            formik.setFieldValue('className', '');
                            formik.setFieldValue('division', '');
                            formik.setFieldValue('studentName', null);
                            formik.setFieldValue('studentId', '');
                          }}
                          disabled={!formik.values.board || !!editData}
                          error={!!formik.errors.medium && formik.touched.medium}
                          helperText={(formik.touched.medium && formik.errors.medium) as string}
                        />
                      )}
                    </ShakingTextField>
                  </Grid>

                  {/* Class */}
                  <Grid size={6}>
                    <ShakingTextField
                      error={!!(formik.touched.className && formik.errors.className)}
                    >
                      {!currentYear ? (
                        <Skeleton variant="rounded" height={40} />
                      ) : (
                        <CustomSelect
                          label="Class *"
                          isLoading={classesLoading}
                          options={(classes || []).map((c: any) => ({
                            label: c.name,
                            value: c.id,
                          }))}
                          value={formik.values.className}
                          onChange={(val: any) => {
                            formik.setFieldValue('className', val);
                            formik.setFieldTouched('className', false);
                            formik.setFieldValue('division', '');
                            formik.setFieldValue('studentName', null);
                            formik.setFieldValue('studentId', '');
                          }}
                          disabled={!formik.values.medium || !!editData}
                          error={!!formik.errors.className && formik.touched.className}
                          helperText={
                            (formik.touched.className && formik.errors.className) as string
                          }
                        />
                      )}
                    </ShakingTextField>
                  </Grid>

                  {/* Division */}
                  <Grid size={6}>
                    <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
                      {!currentYear ? (
                        <Skeleton variant="rounded" height={40} />
                      ) : (
                        <CustomSelect
                          label="Division *"
                          options={(allDivision || []).map((d: any) => ({
                            label: d.name,
                            value: d.id,
                          }))}
                          value={formik.values.division}
                          onChange={(val: any) => {
                            formik.setFieldValue('division', val);
                            formik.setFieldTouched('division', false);
                            formik.setFieldValue('studentName', null);
                            formik.setFieldValue('studentId', '');
                          }}
                          disabled={!formik.values.className || !!editData}
                          error={!!formik.errors.division && formik.touched.division}
                          helperText={(formik.touched.division && formik.errors.division) as string}
                        />
                      )}
                    </ShakingTextField>
                  </Grid>

                  {/* Student */}
                  <Grid size={{ xs: 12, md: 12 }}>
                    <ShakingTextField
                      error={!!(formik.touched.studentName && formik.errors.studentName)}
                    >
                      {!currentYear ? (
                        <Skeleton variant="rounded" height={40} />
                      ) : (
                        <PaginatedSearchSelect
                          key={`${formik.values.className}-${formik.values.division}`}
                          label="Student *"
                          isLoading={studentsLoading}
                          noOptionsText="No Student Found"
                          disabled={!formik.values.division || !!editData}
                          fetchOptions={async (query: string, page: number) => {
                            if (!formik.values.division) return { data: [], hasMore: false };
                            try {
                              const res = await getStudents({
                                page,
                                pageSize: 10,
                                academicYearId: currentYear.id,
                                standardId: formik.values.className,
                                divisionId: formik.values.division,
                                search: query,
                              }).unwrap();
                              const hasMore = res.currentPage !== res.totalPages;
                              return {
                                data: res?.items?.map((item: any) => ({
                                  label: `${item.firstName} ${item.lastName} ${item.middleName}`,
                                  id: item.studentId,
                                  item,
                                })),
                                hasMore,
                              };
                            } catch {
                              return { data: [], hasMore: false };
                            }
                          }}
                          value={
                            formik.values.studentId && formik.values.studentName
                              ? {
                                  label:
                                    (formik.values.studentName as any).name ||
                                    (typeof formik.values.studentName === 'object' &&
                                    formik.values.studentName !== null
                                      ? `${(formik.values.studentName as any).firstName || ''} ${(formik.values.studentName as any).lastName || ''} ${(formik.values.studentName as any).middleName || ''}`
                                      : ''),
                                  id: formik.values.studentId,
                                }
                              : null
                          }
                          isOptionEqualToValue={(option: any, value: any) =>
                            option?.id === value?.id
                          }
                          renderOption={(prop, option: any) => (
                            <li {...prop} key={option.id}>
                              {option.label}
                            </li>
                          )}
                          getOptionLabel={(option: any) => option?.label || ''}
                          minChars={2}
                          onChange={(_, val: any) => {
                            formik.setFieldValue('studentId', val?.id || '');
                            formik.setFieldValue('studentName', val?.item || null);
                            formik.setFieldTouched('studentName', false);
                          }}
                          debounceMs={400}
                          placeholder="Search by name"
                          size="small"
                          sx={{ width: '100%' }}
                          error={!!(formik.touched.studentName && formik.errors.studentName)}
                          helperText={
                            (formik.touched.studentName && formik.errors.studentName) as string
                          }
                        />
                      )}
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
              </Grid>

              {/* Concession Details */}
              <Grid size={{ xs: 12 }}>
                <SectionCard title="Concession Details" paperProps={{ sx: { ...cardStyle } }}>
                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField
                      error={!!(formik.touched.concessions && formik.errors.concessions)}
                    >
                      {isLoadingConcessionTypes ? (
                        <Skeleton variant="rounded" height={40} />
                      ) : (
                        <CustomSelect
                          multiple
                          label="Concession Type(s) *"
                          options={(concessionTypes || []).map((ct: any) => ({
                            label: ct.concessionName,
                            value: ct.concessionName,
                          }))}
                          value={formik.values.concessions?.map((c: any) => c.concessionType) || []}
                          onChange={(val: any) => {
                            const selectedNames = val as string[];
                            const concessionsData = selectedNames.map((name) => {
                              const ct = concessionTypes.find(
                                (item: any) => item.concessionName === name
                              );
                              // Preserve existing concession data for the document updates if it was already selected
                              const existingConcession = formik.values.concessions?.find(
                                (c: any) => c.concessionType === name
                              );
                              return (
                                existingConcession || {
                                  concessionType: ct?.concessionName,
                                  applicableFeeHeads: ct?.applicableFeeHeads || [],
                                  amount: ct?.amount || undefined,
                                  percentage: ct?.percentage || undefined,
                                  documents: ct?.documents || [],
                                }
                              );
                            });
                            formik.setFieldValue('concessions', concessionsData);
                          }}
                          error={!!(formik.errors.concessions && formik.touched.concessions)}
                          helperText={
                            (formik.touched.concessions && formik.errors.concessions) as string
                          }
                        />
                      )}
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
              </Grid>

              {/* Concession Details and Documents per Type */}
              {formik.values.concessions?.length > 0 && (
                <>
                  {formik.values.concessions.map((c, i) => (
                    <Grid key={i} size={{ xs: 12 }}>
                      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" color="#00A76F" gutterBottom>
                            {c.concessionType} Information
                          </Typography>

                          <Grid container spacing={2}>
                            {/* Fee Heads */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="body2" color="text.secondary">
                                Applicable Fee Heads
                              </Typography>
                              <Typography variant="body1">
                                {c.applicableFeeHeads?.length
                                  ? c.applicableFeeHeads.join(', ')
                                  : '-'}
                              </Typography>
                            </Grid>

                            {/* Amount */}
                            {c.amount && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Amount
                                </Typography>
                                <Typography variant="body1">
                                  {formatNumber(c.amount, 'INR')}
                                </Typography>
                              </Grid>
                            )}

                            {/* Percentage */}
                            {c.percentage && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Percentage
                                </Typography>
                                <Typography variant="body1">{c.percentage}%</Typography>
                              </Grid>
                            )}
                          </Grid>

                          {/* Document Table for this Concession */}
                          {c.documents?.length > 0 && (
                            <CustomizableTable
                              tableId={`documents-${i}`}
                              columns={[
                                { id: 'documentName', label: 'Name' },
                                {
                                  id: 'acceptedFormat',
                                  label: 'Accepted Format',
                                  align: 'left',
                                  minWidth: 160,
                                },
                                {
                                  id: 'status',
                                  label: 'Status',
                                  align: 'left',
                                  isFilter: false,
                                  isSort: false,
                                  render: (value, row) => (
                                    <Tooltip title={row.status}>
                                      <Iconify
                                        icon={
                                          row.status === 'Uploaded'
                                            ? 'mdi:approve'
                                            : 'mage:file-cross-fill'
                                        }
                                        height={20}
                                        width={20}
                                        sx={{
                                          color: (theme) =>
                                            row.status === 'Uploaded'
                                              ? 'success.main'
                                              : theme.vars.palette.grey[500],
                                        }}
                                      />
                                    </Tooltip>
                                  ),
                                },
                                {
                                  id: 'upload',
                                  label: 'Upload',
                                  isFilter: false,
                                  isSort: false,
                                  render: (value, row) => (
                                    <IconButton component="label">
                                      <input
                                        type="file"
                                        hidden
                                        onChange={(e) => {
                                          const file = e.currentTarget.files?.[0];
                                          if (file) {
                                            const updatedDocs = formik.values.concessions[
                                              i
                                            ].documents.map((d) =>
                                              d.id === row.id
                                                ? { ...d, file, status: 'Uploaded' }
                                                : d
                                            );
                                            formik.setFieldValue(
                                              `concessions[${i}].documents`,
                                              updatedDocs
                                            );
                                          }
                                        }}
                                      />
                                      <Iconify icon="ci:file-upload" />
                                    </IconButton>
                                  ),
                                },
                                {
                                  id: 'view',
                                  label: 'View',
                                  isFilter: false,
                                  isSort: false,
                                  render: (value, row) => (
                                    <IconButton
                                      onClick={() =>
                                        window.open(URL.createObjectURL(row.file), '_blank')
                                      }
                                      disabled={!row.file}
                                    >
                                      <Iconify icon="carbon:view-filled" />
                                    </IconButton>
                                  ),
                                },
                                {
                                  id: 'download',
                                  label: 'Download',
                                  isFilter: false,
                                  isSort: false,
                                  render: (value, row) => (
                                    <IconButton
                                      onClick={() => {
                                        const url = URL.createObjectURL(row.file);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = row.documentName;
                                        link.click();
                                      }}
                                      disabled={!row.file}
                                    >
                                      <Iconify
                                        icon="material-symbols:download"
                                        width={20}
                                        height={20}
                                      />
                                    </IconButton>
                                  ),
                                },
                              ]}
                              data={c.documents}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              onClick={() => onClose(null, false)}
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              variant="contained"
              size="small"
              loading={isAddLoading || isUpdateLoading}
              onClick={(e: any) => formik.handleSubmit(e)}
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default NewConcessionRequestForm;
