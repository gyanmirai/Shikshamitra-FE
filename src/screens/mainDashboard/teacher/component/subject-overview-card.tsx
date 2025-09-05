import type { Palette } from '@mui/material/styles';
import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import { Box, Card, Chip, ListItem, Typography, ListItemText } from '@mui/material';

interface IStudentData {
  name: string;
  subject: string;
  score: number;
}

interface ISubjectOverviewCardProps {
  icon: string;
  title: string;
  color: string;
  bgColor: keyof Palette;
  href?: string;
  labels?: { name: string; color: LabelColor; value: number | string }[];
  selectOptions?: { value: string; label: string }[];
  selectedValue?: string;
  onSelectChange?: (value: string) => void;
  dropdownLabel?: string;
  studentList: IStudentData[];
}

export function SubjectOverviewCard({
  icon,
  title,
  color,
  bgColor,
  href = '',
  labels = [],
  selectOptions = [],
  selectedValue = '',
  onSelectChange,
  dropdownLabel = '',
  studentList,
}: ISubjectOverviewCardProps) {
  const theme = useTheme();
  const [selectedSubject, setSelectedSubject] = useState<string>(
    selectedValue || (selectOptions.length > 0 ? selectOptions[0].value : '')
  );

  // Function to sort students based on score
  const sortByScore = (subject: string) =>
    studentList.filter((student) => student.subject === subject).sort((a, b) => b.score - a.score);

  const top5Students = [...studentList].sort((a, b) => b.score - a.score).slice(0, 5);
  const bottom5Students = selectedSubject ? sortByScore(selectedSubject).slice(-5) : [];

  const handleSelectChange = (e: string) => {
    setSelectedSubject(e);
    if (onSelectChange) onSelectChange(e);
  };

  return (
    <Box component={Link} href={href} sx={{ textDecoration: 'none' }}>
      <Card
        sx={{
          p: 2,

          height: '300px',

          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title & Dropdown Section */}
        <Box display="flex" alignItems="flex-end" justifyContent="space-between" width="30%">
          {/* Dropdown for Selecting Subject */}
          {selectOptions.length > 0 && (
            <CustomSelect
              label={dropdownLabel}
              options={selectOptions}
              value={selectedSubject}
              onChange={(e) => handleSelectChange(e as string)}
              formControlProps={{ fullWidth: false }} // Ensures it doesn't stretch
            />
          )}
        </Box>

        {/* Top & Bottom Performers Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          {/* Top Performers */}
          <Box flex={1} mr={2}>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography variant="subtitle1" color="black">
                Top Performers
              </Typography>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'all', label: 'All Subjects' },
                  { value: 'math', label: 'Math' },
                  { value: 'science', label: 'Science' },
                  { value: 'english', label: 'English' },
                ]}
                value="all"
                onChange={(e) => console.log(e)}
              />
            </Box>
            <Scrollbar sx={{ minHeight: 200, maxHeight: 200, overflowY: 'auto', bgcolor: 'white' }}>
              {top5Students.map((student, index) => (
                <ListItem key={index}>
                  <ListItemText primary={student.name} secondary={`Score: ${student.score}`} />
                  {/* <Chip size="small" label="Top" color="success" /> */}
                </ListItem>
              ))}
            </Scrollbar>
          </Box>

          {/* Bottom Performers */}
          <Box flex={1}>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography variant="subtitle1" color="black">
                Bottom Performers
              </Typography>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'all', label: 'All Subjects' },
                  { value: 'math', label: 'Math' },
                  { value: 'science', label: 'Science' },
                  { value: 'english', label: 'English' },
                ]}
                value="all"
                onChange={(e) => console.log(e)}
              />
            </Box>
            <Scrollbar sx={{ minHeight: 200, maxHeight: 200, overflowY: 'auto', bgcolor: 'white' }}>
              {bottom5Students.length > 0 ? (
                bottom5Students.map((student, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={student.name} secondary={`Score: ${student.score}`} />
                    <Chip size="small" label="Low" color="warning" />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                  No data available
                </Typography>
              )}
            </Scrollbar>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
