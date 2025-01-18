import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

import { getSession, SessionData, sessionOptions } from '../../../lib';

export async function GET() {
  try {
    const session = await getSession();
    const filePath = path.join(process.cwd(), 'public', 'tokenSet.json');
    let file;
    try {
      const response = await fs.readFile(filePath, 'utf-8');

      file = JSON.parse(response);
    } catch (error) {
      file = {};
    }
    const userInfo = file[session?.userInfo?.sub];
    await fs.writeFile('src/tokenSet.json', JSON.stringify(file));
    return NextResponse.json(userInfo || null);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
