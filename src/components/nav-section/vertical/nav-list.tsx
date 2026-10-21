import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { usePathname } from 'src/routes/hooks';
import { useEffect, useCallback } from 'react';
import { isExternalLink } from 'src/routes/utils';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasNavigationPermission } from 'src/utils/permissions';

import { NavItem } from './nav-item';
import { navSectionClasses } from '../classes';
import { NavUl, NavLi, NavCollapse } from '../styles';
import { isNavigationPathActive } from '../path-utils';

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
  const { permissions } = useSelector((state: RootState) => state.auth);
  const isGranted = hasNavigationPermission(permissions, data.permissionName);

  const [currentModule] = removeTrailingSlash.split('/').filter((i) => i);
  // const active = useActiveLink(data.path, !!data.children);
  const active = isSubLayout
    ? isNavigationPathActive(removeTrailingSlash, data.path, true, data.excludeActivePaths)
    : removeTrailingSlash === data.path ||
      (data.path !== '/dashboard' && currentModule === data._action);

  // const [openMenu, setOpenMenu] = useState(false);

  const recur = useCallback(
    (menuData: NavListProps['data'][]): NavListProps['data'] | undefined =>
      menuData?.find(
        (i) =>
          isNavigationPathActive(removeTrailingSlash, i.path, isSubLayout, i.excludeActivePaths) ||
          (i?.children?.length && recur(i.children))
      ),
    [isSubLayout, removeTrailingSlash]
  );

  // Route ancestry is independent of manually expanded groups. Finance's menu
  // hierarchy does not mirror its URL hierarchy (Settings even has no path).
  const hasActiveDescendant = Boolean(data.children && recur(data.children));
  const { value: activeMenuCollapsed, onToggle, onFalse } = useBoolean();

  // Manual collapse applies to the current page only; a new route reveals its ancestry.
  useEffect(() => {
    onFalse();
  }, [removeTrailingSlash, onFalse]);

  const handleToggleMenu = () => {
    if (!data.children || !setCurrentOpenMenu) return;
    if (hasActiveDescendant) {
      onToggle();
      return;
    }
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

  const isOpen = hasActiveDescendant
    ? !activeMenuCollapsed
    : (currentOpenMenu || []).some((m) => m.action === data._action);
  const renderNavItem = (
    <NavItem
      render={render}
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      depth={depth}
      active={active || hasActiveDescendant || isOpen}
      disabled={data.disabled}
      hasChild={!!data.children}
      open={isOpen}
      aria-expanded={data.children ? isOpen : undefined}
      externalLink={isExternalLink(data?.path || '')}
      enabledRootRedirect={enabledRootRedirect}
      preserveQueryParams={data.preserveQueryParams}
      slotProps={data?.children ? slotProps?.rootItem : slotProps?.subItem}
      onClick={handleToggleMenu}
    />
  );
  if (data.permissionName && !isGranted) return null;
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
