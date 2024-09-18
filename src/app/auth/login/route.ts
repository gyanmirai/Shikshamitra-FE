import { getSession } from '../../../lib';
import { generators } from 'openid-client';
import { clientConfig, getClient } from '../../../utils/client';

export async function GET() {
  try {
    const session = await getSession();
    session.code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(session.code_verifier);
    const client = await getClient();
    const url = client.authorizationUrl({
      scope: clientConfig.scope,
      audience: clientConfig.audience,
      redirect_uri: clientConfig.redirect_uri,
      code_challenge,
      code_challenge_method: 'S256',
      __tenant: session.tenantId,
    });
    await session.save();
    return Response.redirect(url);
  } catch (error) {
    return Response.json(error);
  }
}
