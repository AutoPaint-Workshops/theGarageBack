import request from 'supertest';
import { describe, expect, test } from 'vitest';

import { app } from '../../index.js';
import { resetDb } from '../helpers/reset-db.js';
import { getUsers } from '../helpers/createProfiles.js';

describe('SignIn tests', () => {
  beforeEach(async () => {
    await resetDb();
  });

  test('Sign in with correct data', async () => {
    const cliente = await getUsers('cliente');
    await request(app)
      .post('/api/auth/signin')
      .send({
        correo: cliente.userData.correo,
        contrasena: cliente.password,
      })
      .expect(200);

    await request(app)
      .post('/api/auth/signin')
      .send({
        correo: cliente.userData.correo,
        contrasena: 'Contra123456789',
      })
      .expect(403);
  });

  test('Sign in with incorrect data', async () => {
    await request(app)
      .post('/api/auth/signin')
      .send({
        correo: 'unexistent@example.com',
        contrasena: 'Contra123',
      })
      .expect(403);

    await request(app)
      .post('/api/auth/signin')
      .send({
        correo: {},
        contrasena: '123',
      })
      .expect(500);
  });
});
