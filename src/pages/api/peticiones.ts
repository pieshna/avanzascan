import { APIRoute } from 'astro';
import { db } from '../../lib/db';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  //guardamos el body de la peticion
  const body = await request.json();
  const userId = cookies.get('session')?.value; // Obtenemos el ID de usuario de la cookie
  if (!userId) {
    return new Response(
      JSON.stringify({ message: 'No se ha encontrado el ID de usuario' }),
      { status: 401 }
    );
  }

  // Guardamos la petición en la base de datos
  const id = crypto.randomUUID(); // Generamos un ID único para la petición
  await db.run('INSERT INTO peticiones (id, user_id, body) VALUES (?, ?, ?)', [
    id,
    userId,
    JSON.stringify(body),
  ]);

  return new Response(JSON.stringify({ id }));
};
