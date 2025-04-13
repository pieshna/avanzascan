import { APIRoute } from 'astro';
import * as bcrypt from 'bcrypt';
import { db } from '../../lib/db';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const data = request.json();
  const { username, password } = await data;
  const user = await db.get('SELECT * FROM users WHERE username = ?', [
    username,
  ]);
  if (!user) {
    return new Response(JSON.stringify({ message: 'El usuario no existe' }), {
      status: 401,
    });
  }
  const isValidPassword = await bcrypt.compare(password, user.hashed_password);
  if (!isValidPassword) {
    return new Response(JSON.stringify({ message: 'Contraseña incorrecta' }), {
      status: 401,
    });
  }
  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 1 day
  await db.run(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [sessionId, user.id, expiresAt]
  );
  const headers = new Headers();
  headers.set(
    'Set-Cookie',
    `session=${sessionId}; HttpOnly; Path=/; Max-Age=86400`
  );
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ message: 'Login successful' }), {
    status: 200,
    headers: {
      'Set-Cookie': `session=${sessionId}; HttpOnly; Path=/; Max-Age=86400`,
      'Content-Type': 'application/json',
    },
  });
};
