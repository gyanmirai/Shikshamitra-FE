import { convertBase64Format } from 'src/utils/base64Formate';

export type AccountProfile = {
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  unique_name?: string;
  email?: string;
  role?: string | string[];
};

type AccountEmployee = { fullName?: string; shortName?: string; profilePicture?: string };

export function getAccountIdentity(profile?: AccountProfile, employee?: AccountEmployee | null) {
  const fullName = [profile?.given_name, profile?.family_name].filter(Boolean).join(' ').trim();
  const displayName =
    employee?.fullName?.trim() ||
    profile?.name?.trim() ||
    fullName ||
    profile?.preferred_username?.trim() ||
    profile?.unique_name?.trim() ||
    profile?.email?.trim() ||
    'My account';
  const names = displayName.split(/[\s_-]+/).filter(Boolean);
  const initials =
    employee?.shortName?.trim() ||
    (names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : displayName.slice(0, 2));
  const roles = (Array.isArray(profile?.role) ? profile.role : [profile?.role]).filter(
    (role): role is string => typeof role === 'string' && Boolean(role.trim())
  );

  return {
    displayName,
    email: profile?.email?.trim() || '',
    roleLabel: roles.join(', '),
    initials: initials.toUpperCase(),
    photoURL: convertBase64Format(employee?.profilePicture || ''),
  };
}

export type AccountIdentity = ReturnType<typeof getAccountIdentity>;

export function hasAccountRole(role: AccountProfile['role'], expectedRole: string) {
  const roles = Array.isArray(role) ? role : [role];
  return roles.some((value) => String(value || '').toLowerCase() === expectedRole);
}
