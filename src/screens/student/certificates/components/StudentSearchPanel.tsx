import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import { useGetFeeCollectionListQuery } from 'src/redux/feeCollection/feeCollection';
import {
  Box,
  Card,
  List,
  Avatar,
  Divider,
  TextField,
  Typography,
  ListItemText,
  InputAdornment,
  ListItemButton,
  ListItemAvatar,
  CircularProgress,
} from '@mui/material';

export interface SelectedStudent {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  grNo: string | number;
  admissionNo?: string;
  className?: string;
  divisionName?: string;
  gender?: string;
  dateOfBirth?: string;
  organizationId: string;
  standardId: string;
  divisionId: string;
  organizationName?: string;
  photo?: string;
}

interface StudentSearchPanelProps {
  selectedStudent: SelectedStudent | null;
  onSelectStudent: (student: SelectedStudent) => void;
}

const StudentSearchPanel: React.FC<StudentSearchPanelProps> = ({
  selectedStudent,
  onSelectStudent,
}) => {
  const {
    currentMedium: medium,
    currentYear,
    currentBoard,
  } = useSelector((state: RootState) => state.globalState);

  const [searchText, setSearchText] = useState('');

  const [tableParams, setTableParams] = useState({
    page: 1,
    rowsPerPage: 100,
    searchTerm: '',
  });

  const {
    data: studentsData,
    isLoading,
    isFetching,
    isError,
  } = useGetFeeCollectionListQuery(
    {
      academicYearId: currentYear?.id,
      boardId: currentBoard?.id,
      educationMediumId: medium?.id,
      skipCount: (tableParams.page - 1) * tableParams.rowsPerPage,
      maxResultCount: tableParams.rowsPerPage,
      search: tableParams.searchTerm || undefined,
    },
    { skip: !currentYear?.id || !currentBoard?.id || !medium?.id || !tableParams.searchTerm }
  );

  const [allStudents, setAllStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!searchText) {
      setAllStudents([]);
    }
  }, [searchText]);

  useEffect(() => {
    if (studentsData?.items) {
      setAllStudents((prev) => {
        if (tableParams.page === 1) return studentsData.items;
        // Merge without duplicates
        const newItems = studentsData.items.filter(
          (item: any) =>
            !prev.some((p: any) => (p.id || p.studentId) === (item.id || item.studentId))
        );
        return [...prev, ...newItems];
      });
    }
  }, [studentsData, tableParams.page]);

  const hasMore =
    searchText && studentsData?.totalCount ? allStudents.length < studentsData.totalCount : false;

  const loadMore = React.useCallback(() => {
    setTableParams((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const sentinelRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore, isFetching]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setTableParams((prev) => ({
        ...prev,
        page: 1,
        searchTerm: searchText,
      }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText]);

  const students: SelectedStudent[] = useMemo(
    () =>
      allStudents.map((item: any) => ({
        id: item.id || item.studentId || '',
        name:
          item.studentName ||
          `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim(),
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        middleName: item.middleName || '',
        grNo: item.grNo || item.grNumber || '',
        admissionNo: item.admissionNo || item.admissionNumber || '',
        className: item.standardDivision || '',
        divisionName: '',
        gender: item.gender || '',
        dateOfBirth: item.dateOfBirth || item.dob || '',
        organizationId: '',
        standardId: '',
        divisionId: '',
        organizationName: '',
        photo: item.photo || item.photoUrl || '',
      })) || [],
    [allStudents]
  );

  const filtered = useMemo(() => {
    if (!searchText.trim()) return students;
    const q = searchText.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.grNo).toLowerCase().includes(q) ||
        String(s.admissionNo || '')
          .toLowerCase()
          .includes(q)
    );
  }, [students, searchText]);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          pb: 1,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1}>
          Student Search
        </Typography>

        {/* Search field */}
        <TextField
          size="small"
          fullWidth
          placeholder="Name, GR No, Admission No…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 18, height: 18 }}
                />
              </InputAdornment>
            ),
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <Iconify
                  icon="mdi:close"
                  sx={{ cursor: 'pointer', color: 'text.secondary', width: 16 }}
                  onClick={() => setSearchText('')}
                />
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 0.75 }}
        />
      </Box>

      {/* Student count */}
      {filtered.length > 0 && (
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.selected' }}>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      )}

      {/* Student list */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {isLoading && searchText ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : isError ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              gap: 1,
              px: 2,
            }}
          >
            <Iconify icon="mdi:alert-circle-outline" width={40} sx={{ color: 'error.main' }} />
            <Typography variant="caption" color="error.main" textAlign="center">
              Failed to load students
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              gap: 1,
              px: 2,
            }}
          >
            <Iconify icon="mdi:account-search-outline" width={40} sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" textAlign="center">
              {searchText ? 'No students found' : 'Search to load students'}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {filtered.map((student, idx) => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <React.Fragment key={student.id || idx}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onSelectStudent(student)}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      transition: 'all 0.15s',
                      ...(isSelected
                        ? {
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                            borderLeft: (t) => `3px solid ${t.palette.primary.main}`,
                          }
                        : {
                            borderLeft: '3px solid transparent',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }),
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar
                        src={student.photo}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: 13,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      >
                        {student.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={isSelected ? 700 : 500} noWrap>
                          {student.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                          GR: {student.grNo || '—'} &nbsp;·&nbsp; {student.className}{' '}
                          {student.divisionName}
                        </Typography>
                      }
                    />
                    {isSelected && (
                      <Iconify
                        icon="mdi:check-circle"
                        width={16}
                        sx={{ color: 'primary.main', ml: 0.5, flexShrink: 0 }}
                      />
                    )}
                  </ListItemButton>
                  <Divider component="li" sx={{ opacity: 0.5 }} />
                </React.Fragment>
              );
            })}
          </List>
        )}

        <Box ref={sentinelRef} sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          {hasMore && <CircularProgress size={24} thickness={3} />}
        </Box>
      </Box>
    </Card>
  );
};

export default StudentSearchPanel;
