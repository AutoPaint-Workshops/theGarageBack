import request from 'supertest';
import { describe, expect, test } from 'vitest';
import FormData from 'form-data';

import { app } from '../../index.js';
import { resetDb } from '../helpers/reset-db.js';
import { getUsers } from '../helpers/createProfiles.js';
import { getAuth } from '../helpers/getAuth.js';

describe('My Profile test', () => {
  beforeEach(async () => {
    await resetDb();
  });

  test('Get my profile info as Client', async () => {
    const client = await getUsers('cliente');
    const token = getAuth(client);

    await request(app)
      .get('/api/v1/perfil')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('Get my profile info as Company', async () => {
    const company = await getUsers('empresa');
    const token = getAuth(company);

    await request(app)
      .get('/api/v1/perfil')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('Update my profile info as Client', async () => {
    const client = await getUsers('cliente');
    const token = getAuth(client);
    const data = {
      userData: {
        direccion: 'Calle 123',
      },
      userTypeData: {
        nombre_completo: 'Nuevo nombre',
      },
    };
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .put('/api/v1/perfil')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send(formData.getBuffer());
    expect(response.status).toBe(200);
    expect(response.body.user.direccion).toBe(data.userData.direccion);
    expect(response.body.typeData.nombre_completo).toBe(
      data.userTypeData.nombre_completo,
    );

    const badRequest = await request(app)
      .put('/api/v1/perfil')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`);
    expect(badRequest.status).toBe(500);
  });

  test('Update my profile info as Company', async () => {
    const company = await getUsers('empresa');
    const token = getAuth(company);
    const data = {
      userData: {
        direccion: 'Calle 123',
      },
      userTypeData: {
        razon_social: 'Nueva razon social',
      },
    };
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .put('/api/v1/perfil')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send(formData.getBuffer());
    expect(response.status).toBe(200);
    expect(response.body.user.direccion).toBe(data.userData.direccion);
    expect(response.body.typeData.nombre_completo).toBe(
      data.userTypeData.nombre_completo,
    );

    const badRequest = await request(app)
      .put('/api/v1/perfil')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`);
    expect(badRequest.status).toBe(500);
  });

  test('Change my password', async () => {
    const client = await getUsers('cliente');
    const token = getAuth(client);
    const data = {
      password: client.password,
      newPassword: 'NuevaContrasena123',
    };
    const response = await request(app)
      .put('/api/v1/perfil/cambiarcontrasena')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    expect(response.status).toBe(200);

    const badRequest = await request(app)
      .put('/api/v1/perfil/cambiarcontrasena')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'MalaContrasena123',
        newPassword: 'NuevaContrasena123',
      });
    expect(badRequest.status).toBe(400);
  });
});
