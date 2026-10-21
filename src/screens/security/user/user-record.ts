export type UserRecord = {
  id: string;
  userName: string;
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  profilePicture?: string | null;
};

export type UserAction = 'visibility' | 'permissions' | 'academic';
export type UserActionHandler = (action: UserAction, user: UserRecord) => void;

export function getUserDisplayName(user: UserRecord) {
  return (
    [user.name?.trim(), user.surname?.trim()].filter(Boolean).join(' ') ||
    user.userName?.trim() ||
    user.email?.trim() ||
    'Unnamed user'
  );
}
