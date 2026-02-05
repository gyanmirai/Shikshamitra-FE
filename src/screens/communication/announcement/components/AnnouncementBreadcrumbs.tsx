import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { ISchoolWiseAnnouncement } from '../type';

// ----------------------------------------------------------------------

interface Props {
  open: boolean;
  viewDialogValue: boolean;
  editingAnnouncement: ISchoolWiseAnnouncement | null;
  onBackToDashboard: () => void;
  onViewBack: () => void;
  onAddAnnouncement: () => void;
  onCloseDialog: (_e: any, isSubmit?: boolean) => void;
}

export default function AnnouncementBreadcrumbs({
  open,
  viewDialogValue,
  editingAnnouncement,
  onBackToDashboard,
  onViewBack,
  onAddAnnouncement,
  onCloseDialog,
}: Props) {
  if (open) {
    return (
      <CustomBreadcrumbs
        heading={editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
        description={
          editingAnnouncement
            ? 'Update this school-wide announcement with revised messages, event details, or notifications. Efficiently share updated information with students, teachers, and staff.'
            : 'Create or update school-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff.'
        }
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          {
            name: 'Announcements',
            onClick: onBackToDashboard,
          },
          { name: editingAnnouncement ? 'Update Announcement' : 'Add Announcement' },
        ]}
        isBack
        onBack={() => onCloseDialog(null, false)}
      />
    );
  }

  if (viewDialogValue) {
    return (
      <CustomBreadcrumbs
        heading="View Announcement"
        description="View and manage all school-wide announcements, including message content, target audience, and publication status."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Announcements' },
          { name: 'View Announcement' },
        ]}
        isBack
        onBack={onViewBack}
      />
    );
  }

  return (
    <CustomBreadcrumbs
      heading="Announcements"
      description="View and manage all school-wide announcements, including message content, target audience, and publication status."
      links={[
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Announcements' },
      ]}
      action={
        <Button
          size="small"
          startIcon={<Add />}
          variant="contained"
          onClick={onAddAnnouncement}
          sx={{ px: '32px' }}
        >
          Announcement
        </Button>
      }
    />
  );
}
