export type UserRecord = {
  id: string;
  userName: string;
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  roleNames?: string[];
};

export type UserDirectoryPage = { items: UserRecord[]; totalCount: number };
