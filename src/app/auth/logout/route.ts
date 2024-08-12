import { defaultSession, getSession } from '../../../lib';
import { generators } from 'openid-client';
import { clientConfig, getClient } from '../../../utils/client';
import fs from 'fs/promises';

export async function GET() {
  const session = await getSession();
  const client = await getClient();
  var endSession = client.endSessionUrl({
    post_logout_redirect_uri: clientConfig.post_logout_redirect_uri,
    id_token_hint: session.access_token,
    state: generators.state(),
  });
  session.isLoggedIn = defaultSession.isLoggedIn;
  session.access_token = defaultSession.access_token;
  session.userInfo = defaultSession.userInfo;
  await fs.writeFile('src/tokenSet.json', JSON.stringify({}));
  await session.save();
  return Response.redirect(endSession);
}
