'use client';

import type { Division } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { StudentApi, useChangeDivisionMutation } from 'src/redux/student';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetAllStudentGroupQuery } from 'src/redux/student/student-group/student-group';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { TableDivisionDropDownProps } from './type';
import type { IInquiryData } from '../../enrollment/Inquiry';

const ChangeDivisionScreen = ({
  allDivision,
  division,
}: {
  allDivision: Division[];
  division: string;
}) => {
  // State to manage table data
  const [tableData, setTableData] = useState<IInquiryData[]>([]);
  const [initialData, setInitialData] = useState<IInquiryData[]>([]);

  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();

  // Fetch student data using the same query as GR and Roll generation
  const {
    data: getStudentData,
    isLoading: isStudentDataLoading,
    isFetching: isStudentDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentGroupQuery,
    params: division,
    options: {
      skip: !division,
    },
  });

  // Update table data when student data changes
  useEffect(() => {
    if (getStudentData?.data) {
      setTableData(getStudentData.data);
      setInitialData(getStudentData.data);
    }
  }, [getStudentData]);

  // Mutation hook for changing student division
  const [changeDivision, { isLoading: isChangeDivisionLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeDivisionMutation,
  });

  // Select isChanges from confirmPopup state to track if there are unsaved changes
  // This is used to enable/disable the save button
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Handle save button click to update student divisions
  const handelSave = async () => {
    try {
      const updatedStudents = tableData.filter((student) => !!student.divisionId);
      await changeDivision(
        updatedStudents.map((student) => ({
          studentId: student.studentId,
          divisionId: student.divisionId,
        }))
      ).unwrap();
      shikshaMitraToast.success({
        message: `Division ${
          selectedStudents.length === 1
            ? `of student ${selectedStudents[0].name}`
            : `of ${updatedStudents.length} students`
        } updated successfully`,
      });

      // Invalidate cache to refetch updated data
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // State to track selected students for bulk actions
  // Each student has an id and name property
  const [selectedStudents, setSelectedStudents] = useState<{ id: string; name: string }[]>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for sending notifications to selected students
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}
    >
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
          <LoadingButton
            loading={isChangeDivisionLoading}
            startIcon={<Save />}
            variant="contained"
            onClick={handelSave}
            size="small"
            disabled={!isChanges}
          >
            Save
          </LoadingButton>
        </Box>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="change-division-table"
          noDataText={<>No Student Data Found </>}
          isLoading={isStudentDataLoading || isStudentDataFetching}
          columns={[
            { id: 'grNo', label: 'GR No.' },
            { id: 'name', label: 'Name' },
            {
              id: 'divisionId',
              label: 'Division',
              isFilter: false,
              isSort: false,
              render(value, row) {
                return (
                  <TableDivisionDropDown
                    allDivision={allDivision}
                    division={value}
                    currentDivision={division}
                    onChange={(val) => {
                      const newData = tableData.map((item) => {
                        if (item.studentId === row.studentId) {
                          setSelectedStudents([{ id: row.studentId, name: row.name }]);

                          return {
                            ...item,
                            divisionId: val as string,
                          };
                        }
                        return item;
                      });

                      setTableData(newData as IInquiryData[]);
                    }}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />{' '}
        {sendInstantNotificationDialogValue.value && (
          <SendInstantNotificationDialog
            open={sendInstantNotificationDialogValue.value}
            onClose={sendInstantNotificationDialogValue.onFalse}
            data={[]}
            userList={selectedStudents}
          />
        )}
      </BackPopUpChecked>
    </Box>
  );
};

export default ChangeDivisionScreen;

const TableDivisionDropDown = ({
  allDivision,
  division,
  currentDivision,
  onChange,
}: TableDivisionDropDownProps) => (
  <CustomSelect
    options={allDivision || []}
    label="Division"
    value={division}
    onChange={onChange}
    labelKey="name"
    valueKey="id"
    formControlProps={{ sx: { width: '150px', textAlign: 'left' } }}
    onClick={(e) => e.stopPropagation()}
  />
);
