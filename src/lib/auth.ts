import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { Lucia } from 'lucia';
import { db } from './db';

export const auth = new Lucia(
  new BetterSqlite3Adapter(db, {
    user: 'users',
    session: 'sessions',
  })
);
