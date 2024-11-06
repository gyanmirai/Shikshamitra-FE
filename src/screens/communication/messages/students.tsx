import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { ChatView } from 'src/sections/chat/view';

const Students = (props: TabComponentType) => {
  const [classes, setClasses] = useState<string>('');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box>
      <CustomSelect
        options={classData?.items || []}
        value={classes}
        onChange={(val) => {
          setClasses(val as string);
        }}
        label="Class"
        isLoading={isLoading}
        labelKey="name"
        valueKey="name"
        formControlProps={{ sx: { minWidth: 180, mb: 5 } }}
      />
      <ChatView />
    </Box>
  );
};

export default Students;
