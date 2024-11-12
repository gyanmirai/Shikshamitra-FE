import React from 'react';

import { Box, TextField } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import FinanceStudentInfoCardComponent from './component/finance-student-info-card-component';

import type { IUserCard } from './component/finance-student-info-card-component';

const dummyUser: IUserCard = {
  id: '12345',
  name: 'John Doe',
  role: '10-B',
  coverUrl: 'https://example.com/cover.jpg',
  avatarUrl: 'https://example.com/avatar.jpg',
  totalPosts: 120,
  totalFollowers: 4500,
  totalFollowing: 300,
};

const FinanceStudentFeeCardComponent = () => {
  const data = [];
  return (
    <>
      <Box py="15px" display="flex" flexDirection="row" gap={3}>
        <CustomSelect
          label="Class/Grade"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          label="Division"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <TextField
              label="Search by student name or grade"
              variant="outlined"
              size="small"
              fullWidth
              value=""
              onChange={(e) => {}}
            />
      </Box>
      {/* <Grid2 container spacing={2}>
        <Grid2 xs={12} md={6} lg={6}>
          <Box width="100%" pb="15px">
            <TextField
              label="Search by student name or grade"
              variant="outlined"
              size="small"
              fullWidth
              value=""
              onChange={(e) => {}}
            />
          </Box>
        </Grid2>
      </Grid2> */}

      <FinanceStudentInfoCardComponent user={dummyUser} />
    </>
  );
};

export default FinanceStudentFeeCardComponent;
