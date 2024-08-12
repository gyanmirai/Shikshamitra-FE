import { defaultSession, getSession } from '../../lib';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ defaultSession });
    }
    return Response.json({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      isLoggedIn: session.isLoggedIn,
      userInfo: session.userInfo,
    });
  } catch (e) {
    return Response.json({ error: e }, { status: 500 });
  }
}
