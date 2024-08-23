import { NextApiRequest } from 'next/types';
import { getSession } from '../../../lib';
import { jwtDecode } from 'jwt-decode';
import { clientConfig, getClient } from '../../../utils/client';
import fs from 'fs/promises';

export async function GET(request: NextApiRequest) {
  const session = await getSession();
  const client = await getClient();
  const params = client.callbackParams(request);
  session.params = params;
  const tokenSet = await client.callback(clientConfig.redirect_uri, params, {
    code_verifier: session.code_verifier,
  });
  session.isLoggedIn = true;
  session.access_token = tokenSet.access_token;
  await fs.writeFile('src/tokenSet.json', JSON.stringify(tokenSet));
  const decoded = jwtDecode(tokenSet.access_token!);
  session.userInfo = {
    ...decoded,
  };
  await session.save();

  return Response.redirect(clientConfig.post_login_route);
}
