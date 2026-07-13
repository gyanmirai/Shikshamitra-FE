import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Paper, Stack, Button, Divider, Tooltip, TextField, IconButton, Typography } from '@mui/material';

interface BulkGradeEntryToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  onApplyMarks: (marks: number | string) => void;
  onApplyRemark: (remark: string) => void;
  onClearMarks: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const BulkGradeEntryToolbar: React.FC<BulkGradeEntryToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onMarkPresent,
  onMarkAbsent,
  onApplyMarks,
  onApplyRemark,
  onClearMarks,
  onExport,
  onImport,
}) => {
  const [marksValue, setMarksValue] = useState<string>('');
  const [remarkValue, setRemarkValue] = useState<string>('');
  const [showMarksInput, setShowMarksInput] = useState(false);
  const [showRemarkInput, setShowRemarkInput] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <Box
        component={motion.div}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          width: '90%',
          maxWidth: 900,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            boxShadow: (theme) => `0px 20px 40px -10px rgba(0,0,0,0.15)`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
            {/* Left Section: Selected info */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton size="small" onClick={onClearSelection} color="primary">
                <Iconify icon="solar:close-circle-bold" width={20} />
              </IconButton>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedCount} Selected
              </Typography>
            </Stack>

            <Divider orientation="vertical" flexItem />

            {/* Middle Section: Bulk actions */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ flexGrow: 1 }}>
              <Tooltip title="Mark Selected Present">
                <Button
                  size="small"
                  variant="soft"
                  color="success"
                  startIcon={<Iconify icon="solar:user-check-bold" />}
                  onClick={onMarkPresent}
                >
                  Present
                </Button>
              </Tooltip>

              <Tooltip title="Mark Selected Absent">
                <Button
                  size="small"
                  variant="soft"
                  color="error"
                  startIcon={<Iconify icon="solar:user-block-bold" />}
                  onClick={onMarkAbsent}
                >
                  Absent
                </Button>
              </Tooltip>

              {/* Apply custom marks */}
              {showMarksInput ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Marks"
                    type="number"
                    value={marksValue}
                    onChange={(e) => setMarksValue(e.target.value)}
                    sx={{ width: 80, '& .MuiInputBase-input': { py: 0.5 } }}
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    disabled={marksValue === ''}
                    onClick={() => {
                      onApplyMarks(marksValue);
                      setShowMarksInput(false);
                      setMarksValue('');
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" />
                  </IconButton>
                  <IconButton size="small" color="inherit" onClick={() => setShowMarksInput(false)}>
                    <Iconify icon="solar:close-circle-bold" />
                  </IconButton>
                </Stack>
              ) : (
                <Tooltip title="Apply same marks to selected">
                  <Button
                    size="small"
                    variant="soft"
                    color="primary"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    onClick={() => {
                      setShowMarksInput(true);
                      setShowRemarkInput(false);
                    }}
                  >
                    Set Marks
                  </Button>
                </Tooltip>
              )}

              {/* Apply same remark */}
              {showRemarkInput ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Feedback / Remark"
                    value={remarkValue}
                    onChange={(e) => setRemarkValue(e.target.value)}
                    sx={{ width: 160, '& .MuiInputBase-input': { py: 0.5 } }}
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      onApplyRemark(remarkValue);
                      setShowRemarkInput(false);
                      setRemarkValue('');
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" />
                  </IconButton>
                  <IconButton size="small" color="inherit" onClick={() => setShowRemarkInput(false)}>
                    <Iconify icon="solar:close-circle-bold" />
                  </IconButton>
                </Stack>
              ) : (
                <Tooltip title="Apply same remark to selected">
                  <Button
                    size="small"
                    variant="soft"
                    color="info"
                    startIcon={<Iconify icon="solar:chat-round-line-bold" />}
                    onClick={() => {
                      setShowRemarkInput(true);
                      setShowMarksInput(false);
                    }}
                  >
                    Set Remark
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Clear marks for selected">
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={onClearMarks}
                >
                  Clear
                </Button>
              </Tooltip>
            </Stack>

            <Divider orientation="vertical" flexItem />

            {/* Right Section: Import/Export template */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Export Excel Template">
                <IconButton size="small" color="inherit" onClick={onExport}>
                  <Iconify icon="solar:file-download-bold" width={22} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Import Excel Template">
                <IconButton size="small" color="inherit" onClick={onImport}>
                  <Iconify icon="solar:file-send-bold" width={22} sx={{ color: 'primary.main' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </AnimatePresence>
  );
};
