import { NextApiRequest } from 'next/types';
import { getSession } from '../../../lib';
import { jwtDecode } from 'jwt-decode';
import { clientConfig, getClient } from '../../../utils/client';
import fs from 'fs/promises';
import path from 'path';

const decodeToken = (token: string) => {
  const encoder = new TextEncoder();
  const binaryData = encoder.encode(token);
  return binaryData;
};

export async function GET(request: NextApiRequest) {
  try {
    const session = await getSession();
    const client = await getClient();
    const params = client.callbackParams(request);
    session.params = params;
    const tokenSet = await client.callback(clientConfig.redirect_uri, params, {
      code_verifier: session.code_verifier,
    });
    session.isLoggedIn = true;
    session.access_token = tokenSet.access_token;
    const decoded = jwtDecode(tokenSet.access_token!);
    let file;
    try {
      const filePath = path.join(process.cwd(), 'src', 'tokenSet.json');
      const response = await fs.readFile(filePath, 'utf-8');
      file = JSON.parse(response);
    } catch (error) {
      file = {};
    }
    const userTokenSetArray = {
      ...file,
      [decoded.sub as string]: tokenSet,
    };
    await fs.writeFile('src/tokenSet.json', JSON.stringify(userTokenSetArray));
    session.userInfo = {
      ...decoded,
    };
    await session.save();

    return Response.redirect(clientConfig.post_login_route);
  } catch (error) {
    return Response.json(error);
  }
}
