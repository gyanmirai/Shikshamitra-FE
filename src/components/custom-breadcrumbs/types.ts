import type { ElementType } from 'react';
import type { TooltipProps } from '@mui/material';
import type { Theme, SxProps } from '@mui/material/styles';
import type { BreadcrumbsProps } from '@mui/material/Breadcrumbs';

// ----------------------------------------------------------------------

export type BreadcrumbsLinkProps = {
  name?: string;
  href?: string;
  icon?: React.ReactElement;
  onClick?: (e: any) => void;
};

export type CustomBreadcrumbsProps = BreadcrumbsProps & {
  heading?: string | React.ReactNode;
  headingComponent?: ElementType;
  description?: React.ReactNode;
  descriptionDisplay?: 'tooltip' | 'visible';
  moreLink?: string[];
  activeLast?: boolean;
  action?: React.ReactNode;
  links: BreadcrumbsLinkProps[];
  sx?: SxProps<Theme>;
  tooltipProps?: TooltipProps;
  isBack?: boolean;
  onBack?: () => void;
  slotProps?: {
    action: SxProps<Theme>;
    heading: SxProps<Theme>;
    moreLink: SxProps<Theme>;
    breadcrumbs: SxProps<Theme>;
  };
};
