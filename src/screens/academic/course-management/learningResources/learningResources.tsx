'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  type LearningResourceDto,
  useGetLearningResourcesQuery,
  useAddLearningResourceMutation,
  useUpdateLearningResourceMutation,
  usePublishLearningResourceMutation,
  useArchiveLearningResourceMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/LearningResourcesApi/learning-resources-api';

import HierarchyTree from './components/treeStrcutre';
import CreateNewResource from './components/addResourceForm';

import type { IResourceData } from './type';

const LearningResources = (props: TabComponentType) => {
  const addLearningResourceDialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<IResourceData | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const deleteDialog = useBoolean();
  const editResourceDialog = useBoolean();
  const { data: resources = [], isFetching } = useGetLearningResourcesQuery();
  const [addLearningResource, { isLoading: isAdding }] = useAddLearningResourceMutation();
  const [updateLearningResource, { isLoading: isUpdating }] = useUpdateLearningResourceMutation();
  const [publishLearningResource] = usePublishLearningResourceMutation();
  const [archiveLearningResource] = useArchiveLearningResourceMutation();
  const [uploadFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  // Function to close the dialog and reset form state
  const handleClose = (_e: unknown, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      dispatch(setIsChanges(false));
      editResourceDialog.onFalse();
      setIsEdit(false);
      setSelectedEntry(null);
      addLearningResourceDialog.onFalse();
    } else if (!isChanges) {
      setIsEdit(false);
      editResourceDialog.onFalse();
      setSelectedEntry(null);
      addLearningResourceDialog.onFalse();
    }
  };

  // Define breadcrumb navigation links based on form state
  const links = addLearningResourceDialog.value
    ? [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Curriculum', href: '/academic/curriculumSubjects' },
        { name: 'Resources' },
        { name: 'Add Learning Resource' },
      ]
    : [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Curriculum', href: '/academic/curriculumSubjects' },
        { name: 'Resources' },
      ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* CustomBreadcrumbs component for navigation and page header */}
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Resources"
        description={
          addLearningResourceDialog.value
            ? 'Create learning resource details, including the title, content, and associated subject. Manage resources efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize learning resources for each subject efficiently. View the list of resources, add new ones, update existing resources, or remove them as needed.'
        }
        links={links}
        action={
          !addLearningResourceDialog.value && (
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                addLearningResourceDialog.onTrue();
              }}
            >
              Resource
            </Button>
          )
        }
      />

      {/* Conditional rendering of Create/Edit form or Resource list */}

      <CustomDialog
        title={selectedEntry ? 'Update Learning Resource' : 'Add Learning Resource'}
        open={addLearningResourceDialog.value}
        maxWidth="sm"
        handleClose={() => {
          addLearningResourceDialog.onFalse();
          setSelectedEntry(null);
        }}
      >
        <CreateNewResource
          isSaving={isAdding || isUpdating || isUploading}
          onSave={async (values) => {
            try {
              const body = await toResourcePayload(values, uploadFile);
              if (selectedEntry?.id) {
                await updateLearningResource({ id: selectedEntry.id, body }).unwrap();
                shikshaMitraToast.success({ message: 'Learning resource updated successfully.' });
              } else {
                await addLearningResource(body).unwrap();
                shikshaMitraToast.success({ message: 'Learning resource created successfully.' });
              }
              handleClose(null, true);
            } catch (error) {
              console.error('Failed to save learning resource', error);
            }
          }}
          onClose={handleClose}
          data={selectedEntry}
          isEdit={isEdit}
        />
      </CustomDialog>

      <HierarchyTree
        resources={resources}
        isLoading={isFetching}
        onEdit={(resource: LearningResourceDto) => {
          setSelectedEntry(toFormResource(resource));
          setIsEdit(true);
          editResourceDialog.onTrue();
        }}
        onPublish={async (resource) => {
          try {
            await publishLearningResource({ id: resource.id }).unwrap();
            shikshaMitraToast.success({ message: 'Learning resource published successfully.' });
          } catch (error) {
            console.error('Failed to publish learning resource', error);
          }
        }}
        onArchive={async (resource) => {
          try {
            await archiveLearningResource({
              id: resource.id,
              body: { reason: 'Archived from learning resource screen' },
            }).unwrap();
            shikshaMitraToast.success({ message: 'Learning resource archived successfully.' });
          } catch (error) {
            console.error('Failed to archive learning resource', error);
          }
        }}
      />

      <CustomDialog
        title="Update Learning Resource"
        open={editResourceDialog.value}
        maxWidth="sm"
        handleClose={() => {
          editResourceDialog.onFalse();
          setSelectedEntry(null);
        }}
      >
        <CreateNewResource
          isSaving={isAdding || isUpdating || isUploading}
          onSave={async (values) => {
            try {
              const body = await toResourcePayload(values, uploadFile);
              if (selectedEntry?.id) {
                await updateLearningResource({ id: selectedEntry.id, body }).unwrap();
                shikshaMitraToast.success({ message: 'Learning resource updated successfully.' });
              }
              handleClose(null, true);
            } catch (error) {
              console.error('Failed to update learning resource', error);
            }
          }}
          onClose={handleClose}
          data={selectedEntry}
          isEdit={isEdit}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedEntry(null);
        }}
        title="Delete"
        content="Are you sure you want to Delete Resource ?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default LearningResources;

const toFormResource = (resource: LearningResourceDto): IResourceData => ({
  id: resource.id,
  resourceTitle: resource.resourceTitle,
  chapter: resource.chapterId,
  className: resource.standardId,
  subject: resource.subjectId,
  dateUploaded: resource.submittedAt || resource.publishedAt || '',
  document: resource.fileName,
});

const toResourcePayload = async (
  values: IResourceData,
  uploadFile: (body: FormData) => { unwrap: () => Promise<{ data?: string }> }
) => {
  const file = values.document instanceof File ? values.document : null;
  let blobName = String(values.document || values.resourceTitle);
  const fileName = file?.name || blobName;
  const contentType = file?.type || 'application/pdf';
  const size = file?.size || 1;

  if (file) {
    const formData = new FormData();
    formData.append('File', file);
    const uploadResponse = await uploadFile(formData).unwrap();
    blobName = uploadResponse?.data || '';

    if (!blobName) {
      throw new Error('File upload failed.');
    }
  }

  return {
    standardId: values.className,
    subjectId: values.subject,
    chapterId: values.chapter || '',
    resourceTitle: values.resourceTitle,
    topic: values.resourceTitle,
    resourceType: contentType.includes('video') ? 'Video' : 'Document',
    blobName,
    fileName,
    contentType,
    size,
    visibility: 1,
  };
};
