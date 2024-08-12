import { getIronSession } from 'iron-session';
import { getSession, SessionData, sessionOptions } from '../../../lib';
import { clientConfig, getClient } from '../../../utils/client';
import fs from 'fs/promises';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const client = await getClient();
    let session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const body = await req.json();
    const tokenSet = await client.refresh(body.token!);
    await fs.writeFile('src/tokenSet.json', JSON.stringify(tokenSet));
    session.access_token = tokenSet.access_token;
    await session.save();
    return Response.json(tokenSet);
  } catch (error) {
    console.log(error, '===========');
    return Response.redirect('/login');
  }
}
