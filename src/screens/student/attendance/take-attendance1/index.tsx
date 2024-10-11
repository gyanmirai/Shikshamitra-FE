'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Save, Search, RestartAlt, CancelOutlined, CheckCircleOutlined } from '@mui/icons-material';
import {
  Box,
  Chip,
  Paper,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const TakeAttendanceScreen = () => {
  // State to control the dialog visibility
  const dialog = useBoolean();
  // State to store all available mediums
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  // State to store the selected medium
  const [medium, setMedium] = useState<string>('');
  // State to store all available organizations
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State to store the selected organization
  const [organization, setOrganization] = useState<string>('');
  // State to store all available classes
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store the selected class
  const [classes, setClass] = useState<string>('');
  // State to store all available divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store the selected division
  const [division, setDivision] = useState<string>('');
  // State to store the selected date
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  // check if the attendance is saved
  const isSaved = useBoolean();

  // Selector to get the current board from the global state
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  // Custom hook to get board data
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });

  // Effect to fetch board data when the current board changes
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

  // Effect to update mediums when board data changes
  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Dummy student data
  const dummyStudents = [
    { id: 1, name: 'John Doe', rollNo: '001', grNo: 'GR001', class: '10', division: 'A' },
    { id: 2, name: 'Jane Smith', rollNo: '002', grNo: 'GR002', class: '10', division: 'A' },
    { id: 3, name: 'Alice Johnson', rollNo: '003', grNo: 'GR003', class: '10', division: 'B' },
    { id: 4, name: 'Bob Williams', rollNo: '004', grNo: 'GR004', class: '10', division: 'B' },
    { id: 5, name: 'Charlie Brown', rollNo: '005', grNo: 'GR005', class: '10', division: 'C' },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Take Attendance"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Take Attendance' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        <DatePicker
          label="Date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          slotProps={{ textField: { size: 'small', sx: { maxWidth: '250px', width: '100%' } } }}
        />
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
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val: string | string[]) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>

      <Divider sx={{ my: 2 }} />
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search..."
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Reset">
            <IconButton>
              <RestartAlt />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save">
            <IconButton>
              <Save />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          border: (theme) => `1px dashed gray`,
          p: 1,
          borderRadius: 1,
          my: 1,
        }}
      >
        <Typography variant="body1" fontWeight={500} color="error">
          Total Absent : 3
        </Typography>
        {/* <Chip size="small" label="Present" color="success" icon={<CheckCircleOutlined />} /> */}
        <Chip size="small" label="1 - John" color="error" icon={<CancelOutlined />} />
        <Chip size="small" label="2 - Jasmin" color="error" icon={<CancelOutlined />} />
        <Chip size="small" label="3 - Herbert" color="error" icon={<CancelOutlined />} />
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap">
        {dummyStudents.map((student) => (
          <AttendanceCard key={student.id} student={student} />
        ))}
      </Box>
    </Box>
  );
};
export default TakeAttendanceScreen;

const AttendanceCard = ({ student }: any) => {
  const a = null;
  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: '350px',
        borderLeft: (theme) =>
          `4px solid ${student.rollNo === '001' ? theme.palette.error.main : theme.palette.success.main}`,
        cursor: 'pointer',
      }}
    >
      <Box display="flex" gap={1} p={1.5} alignItems="center">
        <Box
          sx={{
            width: '100px',
            height: '100px',
            borderRadius: 2,
            '& img': { width: '100%', height: '100%', objectFit: 'cover' },
          }}
        >
          <img
            src="https://images.rawpixel.com/image_png_200/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 200w, https://images.rawpixel.com/image_png_400/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 400w, https://images.rawpixel.com/image_png_600/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 600w, https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 1600w, https://images.rawpixel.com/image_png_1100/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 2400w, https://images.rawpixel.com/image_png_1300/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 3000w"
            alt="Student"
          />
        </Box>
        <Box flexGrow={1}>
          <Typography variant="h6">{student.name}</Typography>
          <Typography variant="body2">
            <Label color="info">{student.rollNo}</Label>
          </Typography>
          <Typography variant="body2">Class: {student.class}</Typography>
          <Typography variant="body2">Division: {student.division}</Typography>
        </Box>
        {/* <Box> */}
        <IconButton color="success" aria-label="mark present">
          <CheckCircleOutlined />
        </IconButton>
        <IconButton color="error" aria-label="mark absent">
          <CancelOutlined />
        </IconButton>
        {/* </Box> */}
      </Box>
      <Box p={2} sx={{ transition: 'all 0.3s ease-in-out' }}>
        <TextField size="small" label="Remarks" fullWidth multiline rows={2} />
      </Box>
    </Paper>
  );
};
