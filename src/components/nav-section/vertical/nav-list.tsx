import { useState, useEffect, useCallback } from 'react';

import { usePathname } from 'src/routes/hooks';
import { isExternalLink } from 'src/routes/utils';

import { NavItem } from './nav-item';
import { navSectionClasses } from '../classes';
import { NavUl, NavLi, NavCollapse } from '../styles';

import type { NavListProps, NavSubListProps } from '../types';

// ----------------------------------------------------------------------

export function NavList({
  data,
  render,
  depth,
  slotProps,
  enabledRootRedirect,
  isSubLayout = false,
}: NavListProps) {
  const pathname = usePathname();
  const removeTrailingSlash = pathname.replace(/\/$/, '');

  const [currentModule] = removeTrailingSlash.split('/').filter((i) => i);
  // const active = useActiveLink(data.path, !!data.children);
  const active = isSubLayout ? removeTrailingSlash === data.path : currentModule === data._action;

  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const recur = (menuData: NavListProps['data'][]): NavListProps['data'] | undefined =>
      menuData?.find(
        (i) => i.path === removeTrailingSlash || (i?.children?.length && recur(i?.children))
      );
    if (recur(data.children)) {
      setOpenMenu(true);
    }
  }, [data, removeTrailingSlash]);

  const handleToggleMenu = useCallback(() => {
    if (data.children) {
      setOpenMenu((prev) => !prev);
    }
  }, [data.children]);

  // const handleCloseMenu = useCallback(() => {
  //   setOpenMenu(false);
  // }, []);
  const renderNavItem = (
    <NavItem
      render={render}
      // slots
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      // state
      depth={depth}
      active={active || openMenu}
      disabled={data.disabled}
      hasChild={!!data.children}
      open={data.children && openMenu}
      externalLink={isExternalLink(data?.path || '')}
      enabledRootRedirect={enabledRootRedirect}
      // styles
      slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      // actions
      onClick={handleToggleMenu}
    />
  );

  // Hidden item by role
  if (data.roles && slotProps?.currentRole) {
    if (!data?.roles?.includes(slotProps?.currentRole)) {
      return null;
    }
  }

  // Has children
  if (data.children) {
    return (
      <NavLi
        disabled={data.disabled}
        sx={{
          [`& .${navSectionClasses.li}`]: {
            '&:first-of-type': { mt: 'var(--nav-item-gap)' },
          },
        }}
      >
        {renderNavItem}

        <NavCollapse data-group={data.title} in={openMenu} depth={depth} unmountOnExit mountOnEnter>
          <NavSubList
            data={data.children}
            render={render}
            depth={depth}
            slotProps={slotProps}
            enabledRootRedirect={enabledRootRedirect}
            isSubLayout={isSubLayout}
          />
        </NavCollapse>
      </NavLi>
    );
  }

  // Default
  return <NavLi disabled={data.disabled}>{renderNavItem}</NavLi>;
}

// ----------------------------------------------------------------------

function NavSubList({
  data,
  render,
  depth,
  slotProps,
  enabledRootRedirect,
  isSubLayout,
}: NavSubListProps) {
  return (
    <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
      {data.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={depth + 1}
          slotProps={slotProps}
          enabledRootRedirect={enabledRootRedirect}
          isSubLayout={isSubLayout}
        />
      ))}
    </NavUl>
  );
}
