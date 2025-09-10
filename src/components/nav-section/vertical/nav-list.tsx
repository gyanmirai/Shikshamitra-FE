import { usePathname } from 'src/routes/hooks';
import { isExternalLink } from 'src/routes/utils';
import { useState, useEffect, useCallback } from 'react';

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
  currentOpenMenu = '',
  setCurrentOpenMenu = (val: string) => {},
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
      setCurrentOpenMenu(data._action as string);
    }

    return () => {
      setOpenMenu(false);
    };
  }, [data, removeTrailingSlash, setCurrentOpenMenu]);

  const handleToggleMenu = useCallback(
    (e: any) => {
      if (data.children) {
        setCurrentOpenMenu(currentOpenMenu === data._action ? '' : (data._action as string)); // setOpenMenu((prev) => !prev);
      }
    },
    [data.children, data._action, setCurrentOpenMenu, currentOpenMenu]
  );

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
      depth={currentOpenMenu === data._action && !openMenu ? 2 : depth}
      active={active || currentOpenMenu === data._action || openMenu}
      disabled={data.disabled}
      hasChild={!!data.children}
      open={data.children && currentOpenMenu === data._action}
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
        // className={stateClasses({ active: currentOpenMenu === data._action && !openMenu })}
      >
        {renderNavItem}

        <NavCollapse
          data-group={data.title}
          in={currentOpenMenu === data._action}
          depth={depth}
          unmountOnExit
          mountOnEnter
        >
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
