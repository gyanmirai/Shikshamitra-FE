'use client';

import type { Division } from 'src/types/school';

import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save } from '@mui/icons-material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { StudentApi, useChangeDivisionMutation } from 'src/redux/student';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IInquiryData } from '../../enrollment/Inquiry';

const initialData = [
  { id: 1, srNo: 1, grNo: 'GR001', name: 'John Doe', division: '' },
  { id: 2, srNo: 2, grNo: 'GR002', name: 'Jane Smith', division: '' },
  { id: 3, srNo: 3, grNo: 'GR003', name: 'Alice Johnson', division: '' },
];

const ChangeDivisionScreen = ({
  tableData: studentData,
  isLoading,
  allDivision,
  division,
}: {
  isLoading: boolean;
  tableData: IInquiryData[];
  allDivision: Division[];
  division: string;
}) => {
  const [tableData, setTableData] = useState<IInquiryData[]>(studentData);
  const dispatch = useDispatch();
  useEffect(() => {
    setTableData(studentData);
  }, [studentData]);

  const [changeDivision, { isLoading: isChangeDivisionLoading, data }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeDivisionMutation,
  });

  const handelSave = async () => {
    try {
      const res = await changeDivision({
        studentDivisionUpdates: tableData
          .filter((student) => !!student.divisionId)
          .map((student) => ({
            studentId: student.id,
            divisionId: student.divisionId,
          })),
      }).unwrap();
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <Box>
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
          <LoadingButton
            loading={isChangeDivisionLoading}
            startIcon={<Save />}
            variant="outlined"
            onClick={handelSave}
          >
            Save
          </LoadingButton>
        </Box>
        <CustomizableTable
          tableId="change-division-table"
          columns={[
            { id: 'grNoRecord', label: 'GR No.' },
            { id: 'name', label: 'Name' },
            {
              id: 'divisionId',
              label: 'Division',
              isSort: false,
              // renderColumn(value) {
              //   return (
              //     <>
              //       &nbsp;
              //       <TableDivisionDropDown
              //         allDivision={allDivision}
              //         division={columDivision}
              //         onChange={(val) => {
              //           setColumnDivision(val as string);
              //           const newData = tableData.map((item) => ({
              //             ...item,
              //             division: val as string,
              //           }));

              //           setTableData(newData);
              //         }}
              //       />
              //     </>
              //   );
              // },
              render(value, row) {
                return (
                  <TableDivisionDropDown
                    allDivision={allDivision}
                    division={value}
                    currentDivision={division}
                    onChange={(val) => {
                      const newData = tableData.map((item) => {
                        if (item.id === row.id) {
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
        />
      </BackPopUpChecked>
    </Box>
  );
};

export default ChangeDivisionScreen;

interface TableDivisionDropDownProps {
  allDivision: Division[];
  division: string;
  currentDivision: string;
  onChange: (val: string | string[] | number | number[]) => void;
}

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
