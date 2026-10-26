import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Stack, Tooltip, IconButton } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card';

import type { ISubjectAssignmentSubject } from '../type';

type Props = {
  id: string;
  'aria-controls': string;
  subject: ISubjectAssignmentSubject;
  expanded: boolean;
  isPublished: boolean;
  onToggle: () => void;
  onRemove?: () => void;
};

export function SubjectCardHeader({
  id,
  'aria-controls': contentId,
  subject,
  expanded,
  isPublished,
  onToggle,
  onRemove,
}: Props) {
  const name = subject.subjectName || 'Untitled Subject';

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5 }}>
      <FormSectionHeader
        icon={GlobalIcons.issueBook}
        title={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            {name}
            {subject.subjectColor && (
              <Box
                component="span"
                aria-hidden
                sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: subject.subjectColor }}
              />
            )}
          </Box>
        }
        titleTypographyProps={{ id, variant: 'subtitle1', fontWeight: 600 }}
        descriptionTooltip="Configure the subject code, teaching team, learning content, and attachments."
        descriptionTooltipLabel={`${name} information`}
        action={
          <Stack direction="row" spacing={1}>
            {!isPublished && onRemove && (
              <Tooltip
                title={
                  subject.subjectType === 1
                    ? "Can't remove, subject belongs to elective group"
                    : 'Remove subject'
                }
              >
                <span>
                  <IconButton
                    type="button"
                    size="small"
                    aria-label={`Remove ${name}`}
                    onClick={onRemove}
                    disabled={subject.subjectType === 1}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon={GlobalIcons.cancel} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <IconButton
              type="button"
              size="small"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${name} details`}
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={onToggle}
            >
              <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : undefined }} />
            </IconButton>
          </Stack>
        }
      />
    </Box>
  );
}
