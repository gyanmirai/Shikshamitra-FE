import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { useId, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Card, Stack, Tooltip, Collapse, IconButton } from '@mui/material';

import { FormSectionHeader, type FormSectionHeaderProps } from './section-header';

export { FormFieldSpacing } from './field-spacing';
export { FormSectionHeader } from './section-header';

interface FormSectionCardProps extends FormSectionHeaderProps {
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  'aria-label'?: string;
  children?: ReactNode;
  contentSpacing?: number;
  contentSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
}

export function FormSectionCard({
  'aria-label': ariaLabel,
  icon,
  iconSize,
  iconContainerSize,
  title,
  titleTypographyProps,
  description,
  descriptionTooltip,
  action,
  actionFullWidthOnMobile,
  children,
  contentSpacing = 2,
  contentSx,
  sx,
  collapsible = false,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
}: FormSectionCardProps) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded ?? localExpanded;
  const sectionId = useId();
  const toggleId = `${sectionId}-toggle`;
  const contentId = `${sectionId}-content`;
  const toggleLabel = `${expanded ? 'Collapse' : 'Expand'} ${typeof title === 'string' ? title : 'section'}`;

  return (
    <Card
      component="section"
      aria-label={ariaLabel}
      variant="outlined"
      sx={[{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack spacing={collapsible && !expanded ? 0 : contentSpacing} sx={contentSx}>
        <FormSectionHeader
          icon={icon}
          iconSize={iconSize}
          iconContainerSize={iconContainerSize}
          title={title}
          titleTypographyProps={titleTypographyProps}
          description={description}
          descriptionTooltip={descriptionTooltip}
          action={
            collapsible ? (
              <Stack direction="row" spacing={1} alignItems="center">
                {action}
                <Tooltip title={toggleLabel}>
                  <IconButton
                    id={toggleId}
                    size="small"
                    aria-label={toggleLabel}
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => {
                      setLocalExpanded(!expanded);
                      onExpandedChange?.(!expanded);
                    }}
                  >
                    <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : (
              action
            )
          }
          actionFullWidthOnMobile={actionFullWidthOnMobile}
        />
        {collapsible ? (
          <Collapse in={expanded}>
            <Stack id={contentId} role="region" aria-labelledby={toggleId} spacing={contentSpacing}>
              {children}
            </Stack>
          </Collapse>
        ) : (
          children
        )}
      </Stack>
    </Card>
  );
}
