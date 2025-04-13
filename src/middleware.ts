// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(
  async ({ request, redirect }, next) => {
    const url = new URL(request.url);

    if (url.pathname === '/login' || url.pathname === '/register') {
      const cookies = request.headers.get('cookie') || '';
      const session = cookies
        .split('; ')
        .find((row) => row.startsWith('session='));
      if (session && session.split('=')[1] !== 'null') {
        return redirect('/');
      }
    }

    // No aplicar middleware en API o rutas publicas
    if (
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/register') ||
      url.pathname.startsWith('/static') ||
      url.pathname.startsWith('/assets')
    ) {
      return next();
    }

    // Validar sesión solo en rutas protegidas
    const cookies = request.headers.get('cookie') || '';
    const session = cookies
      .split('; ')
      .find((row) => row.startsWith('session='));

    if (!session || session.split('=')[1] === 'null') {
      return redirect('/login');
    }

    return next();
  }
);
