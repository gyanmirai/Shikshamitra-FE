import { usePathname } from 'src/routes/hooks';
import { useEffect, useCallback } from 'react';
import { isExternalLink } from 'src/routes/utils';

import { NavItem } from './nav-item';
import { navSectionClasses } from '../classes';
import { NavUl, NavLi, NavCollapse, stateClasses } from '../styles';

import type { NavListProps, NavSubListProps } from '../types';

// ----------------------------------------------------------------------

export function NavList({
  data,
  render,
  depth,
  slotProps,
  enabledRootRedirect,
  isSubLayout = false,
  currentOpenMenu,
  setCurrentOpenMenu,
}: NavListProps) {
  const pathname = usePathname();
  const removeTrailingSlash = pathname.replace(/\/$/, '');

  const [currentModule] = removeTrailingSlash.split('/').filter((i) => i);
  // const active = useActiveLink(data.path, !!data.children);
  const active = isSubLayout ? removeTrailingSlash === data.path : currentModule === data._action;

  // const [openMenu, setOpenMenu] = useState(false);

  const recur = useCallback(
    (menuData: NavListProps['data'][]): NavListProps['data'] | undefined =>
      menuData?.find(
        (i) => i.path === removeTrailingSlash || (i?.children?.length && recur(i?.children))
      ),
    [removeTrailingSlash]
  );

  useEffect(() => {
    if (data.children && recur(data.children) && setCurrentOpenMenu) {
      // Auto-open this menu if one of its descendants matches current path
      setCurrentOpenMenu((prev) => {
        if (prev.some((m) => m.action === data._action)) return prev; // already tracked
        return [
          ...prev.filter((m) => m.depth !== depth),
          { action: data._action as string, depth },
        ];
      });
    }
  }, [data._action, data.children, recur, removeTrailingSlash, setCurrentOpenMenu, depth]);

  const handleToggleMenu = () => {
    if (!data.children || !setCurrentOpenMenu) return;
    const isOpen = (currentOpenMenu || []).some((m) => m.action === data._action);
    if (isOpen) {
      setCurrentOpenMenu((prev) => prev.filter((m) => m.action !== data._action));
    } else {
      setCurrentOpenMenu((prev) => [
        ...prev.filter((m) => m.depth !== depth),
        { action: data._action as string, depth },
      ]);
    }
  };

  // const handleCloseMenu = useCallback(() => {
  //   setOpenMenu(false);
  // }, []);

  const isOpen = (currentOpenMenu || []).some((m) => m.action === data._action);
  const renderNavItem = (
    <NavItem
      render={render}
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      depth={depth}
      active={active || isOpen}
      disabled={data.disabled}
      hasChild={!!data.children}
      open={isOpen}
      externalLink={isExternalLink(data?.path || '')}
      enabledRootRedirect={enabledRootRedirect}
      slotProps={data?.children ? slotProps?.rootItem : slotProps?.subItem}
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
        className={stateClasses({ active: currentOpenMenu === data._action })}
      >
        {renderNavItem}

        <NavCollapse data-group={data.title} in={isOpen} depth={depth} unmountOnExit mountOnEnter>
          <NavSubList
            data={data.children}
            render={render}
            depth={depth}
            slotProps={slotProps}
            enabledRootRedirect={enabledRootRedirect}
            isSubLayout={isSubLayout}
            currentOpenMenu={currentOpenMenu}
            setCurrentOpenMenu={setCurrentOpenMenu}
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
  currentOpenMenu,
  setCurrentOpenMenu,
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
          currentOpenMenu={currentOpenMenu}
          setCurrentOpenMenu={setCurrentOpenMenu}
        />
      ))}
    </NavUl>
  );
}
