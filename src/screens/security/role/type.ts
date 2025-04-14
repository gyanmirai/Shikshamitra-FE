export interface IPermission {
  name: string;
  displayName: string;
  isGranted: boolean;
  children: IPermission[];
}

export interface IRowComponentProps {
  item: IPermission;
  handlePermissionClick: (permission: IPermission) => void;
  allPermissions: IPermission[];
  setAllPermissions: React.Dispatch<React.SetStateAction<IPermission[]>>;
}
