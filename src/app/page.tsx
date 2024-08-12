import { getSession } from 'src/lib';

export default async function Page() {
  const session = await getSession();
  console.log(session, 'session============');
  return null;
}
