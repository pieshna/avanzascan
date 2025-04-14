import { APIRoute } from 'astro';
import * as bcrypt from 'bcrypt';
import { db } from '../../lib/db';

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.json();

  const { nombre, username, password } = data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = crypto.randomUUID();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [
    username,
  ]);
  if (user) {
    return new Response(JSON.stringify({ message: 'User already exists' }), {
      status: 400,
    });
  }
  if (!username || !password) {
    return new Response(
      JSON.stringify({ message: 'Username and password are required' }),
      {
        status: 400,
      }
    );
  }

  try {
    await db.run(
      'INSERT INTO users (id,nombre, username, hashed_password) VALUES (?, ?, ?, ?)',
      [userId, nombre, username, hashedPassword]
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error creating user' }), {
      status: 409,
    });
  }

  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 1 day
  await db.run(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [sessionId, userId, expiresAt]
  );

  const headers = new Headers();
  headers.set(
    'Set-Cookie',
    `session=${sessionId}; HttpOnly; Path=/; Max-Age=86400`
  );
  headers.set('Location', '/');
  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify({ message: 'User created' }), {
    status: 201,
    headers,
  });
};
