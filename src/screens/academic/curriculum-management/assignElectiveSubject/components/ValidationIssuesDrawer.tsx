'use client';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import {
  Box,
  Chip,
  Drawer,
  Button,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';

import type { AssignmentValidationIssue } from '../types';

interface ValidationIssuesDrawerProps {
  open: boolean;
  onClose: () => void;
  issues: AssignmentValidationIssue[];
  onGoToStudent: (studentId: string) => void;
}

export default function ValidationIssuesDrawer({
  open,
  onClose,
  issues,
  onGoToStudent,
}: ValidationIssuesDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, sm: 420 } } }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Validation Issues</Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>
      <Divider />

      {issues.length === 0 ? (
        <EmptyContent
          title="No issues found"
          description="All students currently have a valid elective assignment."
          sx={{ mt: 4 }}
        />
      ) : (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25, overflowY: 'auto' }}>
          {issues.map((issue) => (
            <Box
              key={issue.id}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  size="small"
                  label={issue.severity === 'error' ? 'Error' : 'Warning'}
                  color={issue.severity === 'error' ? 'error' : 'warning'}
                  variant="soft"
                />
                <Typography variant="subtitle2">{issue.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {issue.description}
              </Typography>
              <Button
                size="small"
                startIcon={<Iconify icon="solar:arrow-right-linear" />}
                onClick={() => onGoToStudent(issue.studentId)}
              >
                Go to student
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Drawer>
  );
}
