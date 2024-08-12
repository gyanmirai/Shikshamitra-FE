'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Tab, Card, Tabs, Button } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import { EmptyContent } from 'src/components/empty-content';
import StudentSearch from 'src/components/studentProfile/studentSearch';

import Records from './records';
import Academic from './academic';
import Attendance from './attendance';
import { ProfileCover } from './profile-cover';
import { StudentInformation } from './information';

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

const TABS = [
  {
    value: 'information',
    label: 'Information',
    icon: <Iconify icon="solar:user-id-bold" width={22} />,
    component: (props: Record<string, string>) => <StudentInformation {...props} />,
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="solar:bill-list-bold" width={22} />,
    component: (props: Record<string, string>) => <Attendance {...props} />,
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="solar:square-academic-cap-bold" width={22} />,
    component: (props: Record<string, string>) => <Academic {...props} />,
  },
  {
    value: 'records',
    label: 'Records',
    icon: <Iconify icon="vaadin:records" width={22} />,
    component: (props: Record<string, string>) => <Records {...props} />,
  },
  { value: 'finance', label: 'Finance', icon: <Iconify icon="map:finance" width={22} /> },
  { value: 'documents', label: 'Documents', icon: <Iconify icon="ion:documents" width={22} /> },
  {
    value: 'communications',
    label: 'Communications',
    icon: <Iconify icon="maki:communications-tower" width={22} />,
  },
];
export function StudentProfile() {
  const [searchParams, setSearchParams] = useSearchParam();
  const tabs = useTabs('information');

  const [filterData, setFilterData] = useState<
    {
      name: string;
      rollNo: string;
      GrNo: string;
      id: number;
    }[]
  >([]);
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

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
    <>
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
        <>
          <Card sx={{ mb: 3, height: 290 }}>
            <ProfileCover
              role={currentStudent?.class}
              name={currentStudent?.name}
              avatarUrl="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp"
              coverUrl=""
              setSearchParams={setSearchParams}
            />

            <Box
              display="flex"
              justifyContent={{ xs: 'center', md: 'flex-end' }}
              sx={{
                width: 1,
                bottom: 0,
                zIndex: 9,
                px: { md: 3 },
                position: 'absolute',
                bgcolor: 'background.paper',
              }}
            >
              <Tabs value={tabs.value} onChange={tabs.onChange}>
                {TABS.map((tab) => (
                  <Tab
                    sx={{ fontSize: '12px' }}
                    key={tab.value}
                    value={tab.value}
                    icon={tab.icon}
                    label={tab.label}
                  />
                ))}
              </Tabs>
            </Box>
          </Card>
          {/* <Scrollbar sx={{ height: '100%', overflowY: 'auto' }}> */}
          {currentActiveComponent?.component && <currentActiveComponent.component />}
          {/* </Scrollbar> */}
        </>
      )}
    </>
  );
}
