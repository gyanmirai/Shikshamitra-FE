'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import debounce from 'src/utils/debounce';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import { EmptyContent } from 'src/components/empty-content';

import Records from './records';
import Academic from './academic';
import Attendance from './attendance';
import { StudentInformation } from './information';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

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

export const useSearchParam = (
  defaultValues: Record<string, string> = {}
): [Record<string, string>, (obj: Record<string, string>) => void] => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const values: Record<string, string> = Object.fromEntries(searchParams.entries());
  const [state, setState] = useState<Record<string, string>>({ ...defaultValues, ...values });
  const setParam = (
    obj: Record<string, string> | ((params: Record<string, string>) => Record<string, string>)
  ): void => {
    if (typeof obj === 'function') {
      setState((pre) => {
        const newObj: Record<string, string> = obj(pre);
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newObj).forEach(([key, value]) => {
          if (!value) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        });
        router.push(`${pathName}?${params.toString()}`);
        return newObj;
      });
    } else {
      setState((prev) => ({ ...prev, ...obj }));
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(obj).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathName}?${params.toString()}`);
    }
  };
  return [state, setParam];
};

export function StudentProfile() {
  const tabs = useTabs('information');

  const [searchParams, setSearchParams] = useSearchParam();

  const [filterData, setFilterData] = useState<
    {
      name: string;
      rollNo: string;
      GrNo: string;
      id: number;
    }[]
  >([]);
  // const [inputValue, setInputValue] = useState('');

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  const handleChange = (e: any) => {
    // @ts-ignore
    setSearchParams((pre) => ({ ...pre, student: '', searchValue: e.target.value }));
    if (e.target.value) {
      debounce(() => {
        handelSearch(e.target.value);
      }, 1000);
    } else {
      setFilterData([]);
    }
    // setInputValue(e.target.value);
  };

  const handelSearch = useCallback(
    (value: string) => {
      const filteredData = value
        ? students.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))
        : [];
      setFilterData(filteredData);
      // @ts-ignore
      setSearchParams((pre: any) => ({
        ...pre,
        isSearch: 'true',
        student: '',
      }));
    },
    [setSearchParams]
  );

  const cureentStudent = students.find((item) => item.id === Number(searchParams?.student));

  useEffect(() => {
    if (searchParams?.isSearch === 'true' && searchParams?.searchValue) {
      handelSearch(searchParams?.searchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardContent sx={{ maxWidth: '1440px', width: '100%', margin: 'auto' }}>
      {(searchParams?.isSearch === 'true' || !searchParams?.isSearch) && (
        <Box sx={{ display: 'flex', mb: 1, gap: 1, alignItems: 'center' }}>
          <TextField
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ color: 'text.disabled', width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
            }}
            size="small"
            value={searchParams?.searchValue}
            onChange={handleChange}
            sx={{ '& input': { fontSize: '12px' } }}
          />
        </Box>
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
      {cureentStudent && (
        <>
          <Paper
            elevation={6}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 3,
              p: 1,
              mb: 1,
              // backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
            }}
          >
            <IconButton
              sx={{ height: '40px', width: '40px', p: 0 }}
              onClick={() => setSearchParams({ isSearch: '', student: '', searchValue: '' })}
            >
              <KeyboardBackspaceIcon />
            </IconButton>
            <img
              src="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp"
              alt="profile-pic"
              style={{ width: 40, height: 40 }}
            />
            <Typography
              variant="caption"
              fontWeight="bold"
              // sx={{ color: (theme) => theme.palette.primary.main }}
            >
              Name : {cureentStudent?.name}
            </Typography>
            <Typography
              variant="caption"
              fontWeight="bold"
              // sx={{ color: (theme) => theme.palette.primary.main }}
            >
              Class : {cureentStudent?.class}
            </Typography>
            <Typography
              variant="caption"
              fontWeight="bold"
              // sx={{ color: (theme) => theme.palette.primary.main }}
            >
              Roll No : {cureentStudent?.rollNo}
            </Typography>

            <Typography
              variant="caption"
              fontWeight="bold"
              // sx={{ color: (theme) => theme.palette.primary.main }}
            >
              Student Status : &nbsp;{' '}
              <Label variant="soft" color="success">
                Active
              </Label>
            </Typography>
          </Paper>
          <Paper sx={{ p: 1 }}>
            <Typography
              variant="caption"
              fontWeight="bold"
              // sx={{ color: (theme) => theme.palette.primary.main }}
            >
              Achieve Badges : &nbsp;{' '}
              <Label variant="soft" color="success">
                Volunteer
              </Label>
              <Label variant="soft" color="warning" sx={{ ml: 1 }}>
                New
              </Label>
              <Label variant="soft" color="info" sx={{ ml: 1 }}>
                VIP
              </Label>
              <Label variant="soft" color="error" sx={{ ml: 1 }}>
                Good Listener
              </Label>
            </Typography>
          </Paper>
        </>
      )}

      {searchParams?.student && (
        <>
          <Tabs
            value={tabs.value}
            onChange={tabs.onChange}
            sx={{ mb: 2, '& .MuiTabs-flexContainer': { gap: 2 } }}
          >
            {TABS.map((tab) => (
              <Tab
                sx={{ fontSize: '12px' }}
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                value={tab.value}
              />
            ))}
          </Tabs>

          {currentActiveComponent?.component && <currentActiveComponent.component />}
        </>
      )}
    </DashboardContent>
  );
}
