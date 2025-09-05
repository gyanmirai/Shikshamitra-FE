'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IAssignRoomProps } from './type';

const AssignRoom: React.FC<IAssignRoomProps> = ({
  roomDialog,
  slotData,
  onRoomSelect,
  onClose,
}) => {
  // Generate initial values with subjectCode as key
  const initialValues = React.useMemo(() => {
    const rooms: Record<string, string> = {};
    slotData.subjects.forEach((sub: any) => {
      rooms[sub.subjectCode] = sub.room || '';
    });
    return { rooms };
  }, [slotData]);

  const validationSchema = Yup.object().shape({
    rooms: Yup.object().shape(
      Object.fromEntries(
        slotData.subjects.map((sub: any) => [
          sub.subjectCode,
          Yup.string().required('Room is required'),
        ])
      )
    ),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedSubjects = slotData.subjects.map((sub: any) => ({
        ...sub,
        room: values.rooms[sub.subjectCode],
      }));
      onRoomSelect({ ...slotData, subjects: updatedSubjects });
    },
  });

  return (
    // <Box display="flex" flexDirection="column" gap={2}>
    <BackPopUpChecked
      initialValues={slotData.subjects}
      currentValues={slotData.subjects.map((s: any) => ({
        ...s,
        room: formik.values.rooms[s.subjectCode],
      }))}
    >
      {/* <form onSubmit={formik.handleSubmit}> */}
      {/* <Scrollbar sx={{ p: 2, height: '200px' }}> */}

      <DialogScrollContent>
        <CustomizableTable
          tableId="Elective-subject-table"
          isFilter={false}
          isPagination={false}
          isSearch={false}
          noDataText={<>No Bulk Update Data Found </>}
          columns={[
            {
              id: 'subject',
              label: 'Subject',
              minWidth: '200px',
              align: 'left',
              isFilter: false,
            },
            {
              id: 'room',
              label: 'Class Room',
              isSort: false,
              minWidth: '200px',
              align: 'left',
              isFilter: false,
              render: (value, row: any) => {
                const fieldName = `rooms.${row.subjectCode}`;
                const hasError =
                  formik.touched.rooms?.[row.subjectCode] && formik.errors.rooms?.[row.subjectCode];

                return (
                  <CustomSelect
                    label="Class Room"
                    labelKey="name"
                    valueKey="id"
                    options={[
                      { id: '101', name: 'Room 101' },
                      { id: '102', name: 'Room 102' },
                      { id: '103', name: 'Room 103' },
                      { id: '104', name: 'Room 104' },
                      { id: '105', name: 'Room 105' },
                    ]}
                    value={formik.values.rooms[row.subjectCode]}
                    onChange={(val) => {
                      formik.setFieldValue(fieldName, val);
                    }}
                    onBlur={() => formik.setFieldTouched(fieldName, true)}
                    error={Boolean(hasError)}
                    helperText={hasError as string}
                    formControlProps={{
                      sx: {
                        minWidth: '150px',
                        width: '100%',
                        mb: 1,
                      },
                    }}
                  />
                );
              },
            },
          ]}
          data={slotData.subjects}
        />
      </DialogScrollContent>
      {/* </Scrollbar> */}
      <DialogActions>
        <Button
          onClick={() => {
            onClose?.(null, false);
          }}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
      {/* </form> */}
    </BackPopUpChecked>
    // </Box>
  );
};

export default AssignRoom;
