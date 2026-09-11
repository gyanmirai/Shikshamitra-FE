import type React from 'react';
import type { PermissionName } from 'src/utils/permissions';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';
import type { Theme, SxProps, CSSObject } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type SlotProps = {
  rootItem?: NavItemSlotProps;
  subItem?: NavItemSlotProps;
  subheader?: SxProps<Theme>;
  paper?: SxProps<Theme>;
  currentRole?: string;
};

export type NavItemRenderProps = {
  navIcon?: Record<string, React.ReactNode>;
  navInfo?: (val: string) => Record<string, React.ReactElement>;
};

export type NavItemSlotProps = {
  sx?: SxProps<Theme>;
  icon?: SxProps<Theme>;
  texts?: SxProps<Theme>;
  title?: SxProps<Theme>;
  caption?: SxProps<Theme>;
  info?: SxProps<Theme>;
  arrow?: SxProps<Theme>;
};

export type NavItemStateProps = {
  depth?: number;
  open?: boolean;
  active?: boolean;
  hasChild?: boolean;
  externalLink?: boolean;
  enabledRootRedirect?: boolean;
};

export type NavItemBaseProps = {
  path?: string;
  preserveQueryParams?: string[];
  shortcutKeyName?: string;
  title: string;
  _action?: string;
  children?: any;
  caption?: string;
  roles?: string[];
  disabled?: boolean;
  render?: NavItemRenderProps;
  slotProps?: NavItemSlotProps;
  icon?: string | React.ReactNode;
  info?: string[] | React.ReactNode;
  style?: any;
  submodule?: any;
  permissionChildren?: NavItemBaseProps[];
  visibility?: boolean;
  permissionName?: PermissionName;
  visibilityPermissionName?: string;
};

export type NavItemProps = ButtonBaseProps & NavItemStateProps & NavItemBaseProps;

export type NavListProps = {
  depth: number;
  cssVars?: CSSObject;
  slotProps?: SlotProps;
  data: NavItemBaseProps;
  render?: NavItemBaseProps['render'];
  enabledRootRedirect?: NavItemStateProps['enabledRootRedirect'];
  isSubLayout?: boolean;
  currentOpenMenu?: { action: string; depth: number }[];
  setCurrentOpenMenu?: React.Dispatch<React.SetStateAction<{ action: string; depth: number }[]>>;
};

export type NavSubListProps = Omit<NavListProps, 'data'> & {
  data: NavItemBaseProps[];
};

export type NavGroupProps = Omit<NavListProps, 'data' | 'depth'> & {
  subheader?: string;
  items: NavItemBaseProps[];
};

export type NavSectionProps = Omit<
  NavListProps,
  'data' | 'depth' | 'currentOpenMenu' | 'setCurrentOpenMenu'
> & {
  sx?: SxProps<Theme>;
  data: {
    subheader?: string;
    items: NavItemBaseProps[];
    _action?: string;
    isSubLayout?: boolean;
    submodule?: NavItemBaseProps[];
    shortcutKeyName?: string;
    visibility?: boolean;
  }[];
};
