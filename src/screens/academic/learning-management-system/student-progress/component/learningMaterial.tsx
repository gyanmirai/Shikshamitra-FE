'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

const LearningMaterial = () => {
  const [subject, setSubject] = useState('');
  const viewLearningMaterial = useBoolean();
  return (
    <Box>
      <CustomSelect
        label="Course/Subject"
        options={[
          {
            value: 'Math',
            label: 'Math',
          },
          {
            value: 'English',
            label: 'English',
          },
        ]}
        value={subject}
        onChange={(val) => {
          setSubject(val as string);
        }}
        formControlProps={{ sx: { minWidth: 200 } }}
      />
      <CustomizableTable
        tableId="learning-material-table"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'resourceType', label: 'Resource Type' },
          { id: 'uploadedDate', label: 'Uploaded Date' },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => {
                    viewLearningMaterial.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={[
          {
            resourceName: 'Algebra Basics',
            resourceType: 'PDF',
            uploadedDate: '2024-01-10',
          },
          {
            resourceName: 'Science Experiments',
            resourceType: 'Video',
            uploadedDate: '2024-01-11',
          },
          {
            resourceName: 'Shakespeare Analysis',
            resourceType: 'Document',
            uploadedDate: '2024-01-12',
          },
          {
            resourceName: 'Geometry Tutorials',
            resourceType: 'Image',
            uploadedDate: '2024-01-13',
          },
        ]}
      />
    </Box>
  );
};

export default LearningMaterial;
