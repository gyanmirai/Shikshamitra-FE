import type { UserRecord } from 'src/redux/user/types';

export type { UserRecord } from 'src/redux/user/types';

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
