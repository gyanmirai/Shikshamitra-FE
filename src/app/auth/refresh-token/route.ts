import { getIronSession } from 'iron-session';
import { getSession, SessionData, sessionOptions } from '../../../lib';
import { clientConfig, getClient } from '../../../utils/client';
import fs from 'fs/promises';
import { cookies } from 'next/headers';
import path from 'path';

export async function POST(req: Request) {
  let session = await getIronSession<SessionData>(cookies(), sessionOptions);
  try {
    const client = await getClient();
    const body = await req.json();
    const tokenSet = await client.refresh(body.token!);
    let file;
    const filePath = path.join(process.cwd(), 'public', 'tokenSet.json');
    try {
      // const filePath = path.join(process.cwd(), 'src', 'tokenSet.json');
      const response = await fs.readFile(filePath, 'utf-8');
      file = JSON.parse(response);
    } catch (error) {
      file = {};
    }
    const tokenSets = {
      ...file,
      [session?.userInfo?.sub!]: tokenSet,
    };

    await fs.writeFile(filePath, JSON.stringify(tokenSets));
    session.access_token = tokenSet.access_token;
    await session.save();
    return Response.json(tokenSet);
  } catch (error) {
    console.log(error, '===========');
    session.destroy();
    cookies().delete('next_js_session');
    return null;
  }
}
