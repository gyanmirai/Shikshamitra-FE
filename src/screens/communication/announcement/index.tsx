'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box, Card } from '@mui/material';

import AnnouncementForm from './components/AnnouncementForm';
import AnnouncementTable from './components/announcementTable';
import { useAnnouncementLogic } from './hooks/useAnnouncementLogic';
import AnnouncementBreadcrumbs from './components/AnnouncementBreadcrumbs';
import AnnouncementActionDialogs from './components/AnnouncementActionDialogs';
import SchoolManagementViewDetails from './components/SchoolWiseDetails/SchoolManagementViewDetails';

const Announcement = (props: TabComponentType) => {
  const { state, dialogs, handlers } = useAnnouncementLogic();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <AnnouncementBreadcrumbs
        open={state.open}
        viewDialogValue={dialogs.viewDialog.value}
        editingAnnouncement={state.editingAnnouncement}
        onBackToDashboard={handlers.handleBackToDashboard}
        onViewBack={handlers.handleViewBack}
        onAddAnnouncement={handlers.handleCreate}
        onCloseDialog={handlers.handleCloseDialog}
      />

      {state.open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AnnouncementForm
            initialValues={state.editingAnnouncement}
            isEdit={!!state.editingAnnouncement}
            onClose={handlers.handleCloseDialog}
          />
        </Card>
      ) : dialogs.viewDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <SchoolManagementViewDetails announcement={state.viewAnnouncement} />
        </Card>
      ) : (
        <AnnouncementTable
          data={state.announcementData?.data}
          isLoading={state.isLoading}
          setOpen={handlers.setOpen}
          onEdit={handlers.handleEdit}
          handleSwitchChange={handlers.handleSwitchChange}
          onDelete={handlers.handleDeleteClick}
          onRemove={handlers.handleRemoveClick}
          onView={handlers.handleViewClick}
          onPublish={handlers.handlePublishClick}
        />
      )}

      <AnnouncementActionDialogs
        deleteDialog={dialogs.deleteDialog}
        publishModal={dialogs.publishModal}
        confirmDialog={dialogs.confirmDialog}
        editingAnnouncement={state.editingAnnouncement}
        publishingAnnouncement={state.publishingAnnouncement}
        removeAnnouncement={state.removeAnnouncement}
        isDeleteLoading={state.isDeleteLoading}
        isPublishLoading={state.isPublishLoading}
        onDeleteCommit={handlers.handleDeleteCommit}
        onPublishCommit={handlers.handlePublishCommit}
        onCloseDeleteDialog={handlers.handleCloseDialog}
        onClosePublishDialog={handlers.handleCloseDialog}
        onCloseRemoveDialog={handlers.handleCloseDialog}
        onCloseGlobal={handlers.handleCloseDialog}
      />
    </Box>
  );
};

export default Announcement;
