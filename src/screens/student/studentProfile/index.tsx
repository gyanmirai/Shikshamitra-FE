'use client';

import { useState, useEffect, useCallback } from 'react';

import { Box, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useSearchParam } from 'src/hooks/use-search-param';

import DataTable from 'src/components/commonTable';
import { EmptyContent } from 'src/components/empty-content';
import StudentTabs from 'src/components/studentProfile/studentTabs';
import StudentSearch from 'src/components/studentProfile/studentSearch';
import StudentInformationCard from 'src/components/studentProfile/studentInformationCard';

const students = [
  {
    id: 1,
    name: 'John Doe',
    rollNo: '001',
    GrNo: 'GR001',
    class: '10th',
  },
  {
    id: 2,
    name: 'Jane Smith',
    rollNo: '002',
    GrNo: 'GR002',
    class: '10th',
  },
  {
    id: 3,
    name: 'Alice Johnson',
    rollNo: '003',
    GrNo: 'GR003',
    class: '10th',
  },
  {
    id: 4,
    name: 'Bob Williams',
    rollNo: '004',
    GrNo: 'GR004',
    class: '10th',
  },
  {
    id: 5,
    name: 'Emma Brown',
    rollNo: '005',
    GrNo: 'GR005',
    class: '10th',
  },
];

export function StudentProfile() {
  const [searchParams, setSearchParams] = useSearchParam();

  const [filterData, setFilterData] = useState<
    {
      name: string;
      rollNo: string;
      GrNo: string;
      id: number;
    }[]
  >([]);

  const handelSearch = useCallback(
    (value: string) => {
      const filteredData = value
        ? students.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))
        : [];

      setSearchParams({ searchValue: value, isSearch: 'true', student: '' });
      setFilterData(filteredData);
    },
    [setSearchParams]
  );

  const handleChange = (value: string) => {
    handelSearch(value);
  };

  const currentStudent = students.find((item) => item.id === Number(searchParams?.student));

  useEffect(() => {
    if (searchParams?.isSearch === 'true' && searchParams?.searchValue) {
      handelSearch(searchParams?.searchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        // maxWidth: '1440px',
        width: '100%',
        margin: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {(searchParams?.isSearch === 'true' || !searchParams?.isSearch) && (
        <StudentSearch value={searchParams?.searchValue} handleChange={handleChange} />
      )}

      {searchParams?.isSearch === 'true' &&
        (filterData.length ? (
          <DataTable
            data={filterData}
            columns={[
              { key: 'name', label: 'Name', width: '10%' },
              { key: 'rollNo', label: 'Roll No', width: '10%' },
              { key: 'GrNo', label: 'Gr No', width: '10%' },
              {
                key: 'name',
                label: 'Action',
                width: '10%',
                render: (row) => (
                  <Button
                    onClick={() => {
                      setSearchParams({
                        student: `${row.id}`,
                        isSearch: 'false',
                        searchValue: row.name,
                      });
                    }}
                    sx={{ justifyContent: 'start' }}
                  >
                    <VisibilityIcon sx={{ fontSize: '18px' }} />
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <EmptyContent title="Student Not Found" />
        ))}
      {currentStudent && (
        <StudentInformationCard currentStudent={currentStudent} setSearchParams={setSearchParams} />
      )}

      {searchParams?.student && <StudentTabs />}
    </Box>
  );
}
