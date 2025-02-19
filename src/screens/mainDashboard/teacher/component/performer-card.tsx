import { orderBy } from 'lodash';
import React, { useState } from 'react';

import { Box, Card, Avatar, CardHeader, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

interface Student {
  id: number;
  name: string;
  subject: string;
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
    selectedSubject === 'all'
      ? list
      : list.filter((student) => student.subject === selectedSubject);

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      {/* Title & Dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box flex={10}>
          <CardHeader title={title} subheader={subheader} sx={{ p: 0 }} />
        </Box>

        <Box flex={2}>
          <CustomSelect
            onChange={handleSubjectChange}
            options={options}
            value={selectedSubject}
            size="small"
            sx={{ width: '150px' }}
          />
        </Box>
      </Box>

      {/* Student List */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {orderBy(filteredList, ['totalMarks'], title === 'Top Performers' ? ['desc'] : ['asc']).map(
          (student) => (
            <Box key={student.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={student.avatarUrl} />
              <Typography>{student.name}</Typography>
            </Box>
          )
        )}
      </Box>
    </Card>
  );
};

export default PerformerCard;
