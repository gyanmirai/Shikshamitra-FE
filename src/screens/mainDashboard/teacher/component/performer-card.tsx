import { orderBy } from 'lodash';
import React, { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Avatar, CardHeader, Typography } from '@mui/material';

interface Student {
  id: number;
  name: string;
  value: string;
  totalMarks: number;
  avatarUrl: string;
}

interface PerformerCardProps {
  title: string;
  subheader: string;
  list: Student[];
  options: { value: string; label: string }[];
}

const PerformerCard: React.FC<PerformerCardProps> = ({ title, subheader, list, options }) => {
  const [selectedSubject, setSelectedSubject] = useState('all');

  const handleSubjectChange = (value: string | number | string[] | number[]) => {
    setSelectedSubject(value as string);
  };

  const filteredList =
    selectedSubject === 'all' ? list : list.filter((student) => student.value === selectedSubject);

  return (
    <Card sx={{ p: 3, height: '100%', minHeight: 380, display: 'flex', flexDirection: 'column' }}>
      {/* Title & Dropdown */}
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}
      >
        <CardHeader
          title={title}
          subheader={subheader}
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
          subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary', mt: 0.5 }}
          sx={{ p: 0, flex: 1 }}
        />

        <Box sx={{ minWidth: 140 }}>
          <CustomSelect
            onChange={handleSubjectChange}
            options={options}
            value={selectedSubject}
            size="small"
            formControlProps={{
              size: 'small',
              sx: { '& .MuiInputBase-root': { fontSize: '0.8125rem' } },
            }}
          />
        </Box>
      </Box>

      {/* Student List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {orderBy(filteredList, ['totalMarks'], title === 'Top Performers' ? ['desc'] : ['asc']).map(
          (student, index) => (
            <Box
              key={student.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1,
                borderRadius: 1.5,
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                src={student.avatarUrl}
                alt={student.name}
                sx={{ width: 40, height: 40, boxShadow: 1 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {student.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Marks:
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontWeight: 700, ml: 0.5, color: 'text.primary' }}
                  >
                    {student.totalMarks}
                  </Typography>
                </Typography>
              </Box>

              {/* Optional: Add a rank or index indicator if "Top" */}
              <Typography
                variant="h6"
                sx={{
                  color: 'text.disabled',
                  fontWeight: 700,
                  opacity: 0.5,
                }}
              >
                #{index + 1}
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Card>
  );
};

export default PerformerCard;
