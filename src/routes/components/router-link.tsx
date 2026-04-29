import Link from 'next/link';

const RouterLink = (props: any) => {
  const linkProps = { ...props };
  delete linkProps.visibility;
  delete linkProps.permissionName;
  delete linkProps._action;
  delete linkProps.roles;
  delete linkProps.caption;
  delete linkProps.render;
  delete linkProps.slotProps;
  delete linkProps.submodule;
  delete linkProps.enabledRootRedirect;
  delete linkProps.externalLink;
  delete linkProps.hasChild;

  return <Link {...linkProps} />;
};
export { RouterLink };
