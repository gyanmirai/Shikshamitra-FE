'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Box } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const ContentLibrary = (props: TabComponentType) => {
  const viewLearningMaterial = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Content Library"
        links={[
          { name: 'Academics' },
          { name: 'Learning Management System' },
          { name: 'Content Library' },
        ]}
        sx={{ mb: 2 }}
      />
      <CustomizableTable
        tableId="content-library-table"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'category', label: 'Category' },
          { id: 'fileType', label: 'File Type' },
          { id: 'uploadedBy', label: 'Uploaded By' },
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
            category: 'Mathematics',
            fileType: 'PDF',
            uploadedBy: 'Mr. Smith',
          },
          {
            resourceName: 'Science Experiments',
            category: 'Science',
            fileType: 'Video',
            uploadedBy: 'Dr. Johnson',
          },
          {
            resourceName: 'Shakespeare Analysis',
            category: 'Literature',
            fileType: 'Document',
            uploadedBy: 'Ms. Williams',
          },
          {
            resourceName: 'Geometry Tutorials',
            category: 'Mathematics',
            fileType: 'Image',
            uploadedBy: 'Mr. Brown',
          },
        ]}
      />
    </Box>
  );
};

export default ContentLibrary;
