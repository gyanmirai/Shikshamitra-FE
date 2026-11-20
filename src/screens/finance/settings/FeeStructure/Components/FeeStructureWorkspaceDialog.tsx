import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { GlobalIcons } from 'src/utils/icons';

import FeeStructureEditForm from './FeeStructureEditForm';

import type { IFeeStructure } from '../type';

interface Props {
  editData: IFeeStructure;
  viewOnly?: boolean;
  onClose: () => void;
}

export default function FeeStructureWorkspaceDialog({
  editData,
  viewOnly = false,
  onClose,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [publishedName, setPublishedName] = useState<string | null>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  useEffect(() => {
    if (!isChanges) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isChanges]);
  const requestClose = () => {
    if (busy) return;
    if (isChanges) setConfirmClose(true);
    else onClose();
  };
  return (
    <>
      <CustomDialog
        title={
          <Box component="span" sx={{ display: 'block' }}>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {viewOnly ? 'View Fee Structure' : 'Manage Fee Structure'}
              <CustomTooltip
                arrow
                placement="bottom"
                title={
                  viewOnly
                    ? 'Review this class’s fee heads, payment terms, linked policies, and publication status.'
                    : 'Configure fee heads and payment terms, attach policies, then review and publish this class’s fee structure.'
                }
              >
                <IconButton
                  size="small"
                  aria-label={`${viewOnly ? 'View' : 'Manage'} Fee Structure information`}
                  sx={{ color: 'info.main', p: 0.25 }}
                >
                  <Iconify icon={GlobalIcons.info} width={18} />
                </IconButton>
              </CustomTooltip>
            </Box>
            <Box
              component="span"
              sx={{
                display: 'block',
                typography: 'caption',
                color: 'text.secondary',
                mt: 0.5,
                overflowWrap: 'anywhere',
              }}
            >
              {editData.name}
              {editData.academicYearName &&
                !editData.name.includes(editData.academicYearName) &&
                ` · ${editData.academicYearName}`}
            </Box>
          </Box>
        }
        open
        fullScreen
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        handleClose={requestClose}
        paperProps={{ sx: { borderRadius: 0, backgroundImage: 'none' } }}
      >
        <FeeStructureEditForm
          editData={editData}
          viewOnly={viewOnly}
          onBusyChange={setBusy}
          onPublished={setPublishedName}
        />
      </CustomDialog>
      <ConfirmDialog
        open={publishedName !== null}
        icon="success"
        title="Fee Structure Published"
        content={`“${publishedName}” is now published. You can keep working here or return to the Fee Structure list.`}
        onClose={() => setPublishedName(null)}
        cancelText="Continue"
        action={
          <Button
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            size="small"
            color="inherit"
            variant="contained"
            disabled={busy}
            onClick={() => {
              setPublishedName(null);
              requestClose();
            }}
          >
            Exit
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Discard unsaved changes?"
        content="Your unsaved Fee Structure changes will be lost when you leave this workspace."
        action={
          <Button
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            size="small"
            color="error"
            variant="contained"
            onClick={onClose}
          >
            Discard & Leave
          </Button>
        }
      />
    </>
  );
}
