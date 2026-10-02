import { Iconify } from 'src/components/iconify';
import { List, Button, ListItem, Typography, ListItemText, ListItemIcon } from '@mui/material';

import type { GradeEntryReviewValidationResult } from '../types/grade-entry-review';

interface GradeEntryReviewIssueListProps {
  validation: GradeEntryReviewValidationResult;
  onFix: (studentId: string) => void;
  disabled?: boolean;
}

export function GradeEntryReviewIssueList({
  validation,
  onFix,
  disabled,
}: GradeEntryReviewIssueListProps) {
  return (
    <List disablePadding>
      {[
        {
          issues: validation.blockers,
          color: 'error' as const,
          icon: 'solar:close-circle-bold',
          action: 'Fix',
        },
        {
          issues: validation.warnings,
          color: 'warning' as const,
          icon: 'solar:danger-bold',
          action: 'View',
        },
      ].flatMap(({ issues, color, icon, action }) =>
        issues.map((issue, index) => (
          <ListItem
            key={`${color}-${issue.code}-${issue.studentId ?? index}`}
            sx={{
              py: 0.5,
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-child': { borderBottom: 0 },
            }}
            secondaryAction={
              issue.studentId && (
                <Button
                  size="small"
                  color={color}
                  disabled={disabled}
                  onClick={() => {
                    if (issue.studentId) onFix(issue.studentId);
                  }}
                >
                  {action}
                </Button>
              )
            }
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Iconify icon={icon} sx={{ color: `${color}.main` }} />
            </ListItemIcon>
            <ListItemText
              primary={issue.message}
              primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
            />
          </ListItem>
        ))
      )}
      {validation.blockers.length === 0 && validation.warnings.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          {validation.isValid
            ? 'All validation checks passed! No issues detected.'
            : 'No detailed validation issues were returned. Review the entries and try again.'}
        </Typography>
      )}
    </List>
  );
}
