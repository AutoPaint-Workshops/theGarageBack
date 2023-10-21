import request from 'supertest';
import { describe, expect, test } from 'vitest';
import FormData from 'form-data';

import { app } from '../../index.js';
import { resetDb } from '../helpers/reset-db.js';
import { getClient, getCompany } from '../fixtures/fakerData.fixture.js';
import { getUsers } from '../helpers/createProfiles.js';
import { signToken } from '../../api/v1/auth.js';

describe('SignUp tests', () => {
  beforeEach(async () => {
    await resetDb();
  });

  test('Sign Up Client with correct data', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = getClient();
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/cliente/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message:
        'Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta',
    });
  });

  test('Sign Up Client with incorrect data', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = { info: false };
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/cliente/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(400);
  });

  test('Sign Up Client with duplicate e-mail', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = getClient();
    const email = data.userData.correo;
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/cliente/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message:
        'Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta',
    });

    const formData2 = new FormData();
    const photoBinary2 = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data2 = getClient();
    data2.userData.correo = email;
    formData2.append('data', JSON.stringify(data2));
    formData2.append('images', photoBinary2, {
      filename: 'imagen_simulada.png',
    });
    const response2 = await request(app)
      .post('/api/v1/auth/cliente/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData2.getBoundary()}`,
      )
      .send(formData2.getBuffer());
    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      error: {
        message:
          'No se pudo crear el usuario, el correo, documento o nit ya se encuentra registrado en el sistema',
        status: 400,
      },
    });
  });

  test('Sign Up Company with correct data', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = getCompany();
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/empresa/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message:
        'Usuario creado satisfactoriamente, espera a que un administrador confirme tu cuenta',
    });
  });

  test('Sign Up Company with incorrect data', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = { info: false };
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/empresa/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(400);
  });

  test('Sign Up Company with duplicate e-mail', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = getClient();
    const email = data.userData.correo;
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/cliente/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message:
        'Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta',
    });

    const formData2 = new FormData();
    const photoBinary2 = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data2 = getCompany();
    data2.userData.correo = email;
    formData2.append('data', JSON.stringify(data2));
    formData2.append('images', photoBinary2, {
      filename: 'imagen_simulada.png',
    });
    const response2 = await request(app)
      .post('/api/v1/auth/empresa/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData2.getBoundary()}`,
      )
      .send(formData2.getBuffer());
    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      error: {
        message:
          'No se pudo crear el usuario, el correo, documento o nit ya se encuentra registrado en el sistema',
        status: 400,
      },
    });
  });

  test('Activate account', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = getClient();
    const email = data.userData.correo;
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/cliente/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message:
        'Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta',
    });

    const activation_url = await request(app)
      .post('/api/v1/auth/testactivation')
      .send({ correo: email });
    expect(activation_url.status).toBe(200);

    const token = activation_url.body.activation_url.split('activacion/').pop();
    const response2 = await request(app).post(
      `/api/v1/auth/confirmacion/${token}`,
    );
    expect(response2.status).toBe(201);
    expect(response2.body).toEqual({
      message: 'Autenticacion correcta',
    });

    const badRequest = await request(app).post(`/api/v1/auth/confirmacion/123`);
    expect(badRequest.status).toBe(400);
  });

  test('Resend email', async () => {
    const formData = new FormData();
    const photoBinary = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);
    const data = getClient();
    const email = data.userData.correo;
    formData.append('data', JSON.stringify(data));
    formData.append('images', photoBinary, { filename: 'imagen_simulada.png' });
    const response = await request(app)
      .post('/api/v1/auth/cliente/signup')
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message:
        'Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta',
    });

    const resendEmail = await request(app)
      .post('/api/v1/auth/reenviarcorreo')
      .send({ correo: email });
    expect(resendEmail.status).toBe(200);
    expect(resendEmail.body).toEqual({
      message: 'Se ha enviado el mensaje de autenticación a tu correo',
    });

    const badEmail = await request(app)
      .post('/api/v1/auth/reenviarcorreo')
      .send({ correo: 'unexistent@example.com' });
    expect(badEmail.status).toBe(400);
    expect(badEmail.body).toEqual({
      error: {
        message: 'El email no se encuentra registrado',
        status: 400,
      },
    });
  });

  test('Password recovery', async () => {
    const client = await getUsers('cliente');
    const correo = client.userData.correo;
    const response = await request(app)
      .post('/api/v1/auth/recuperarcontrasena')
      .send({ correo: correo });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message:
        'Si su correo se encuentra registrado, recibira un correo con un enlace para continuar',
      status: 200,
    });

    const tipoUsuario = client.userData.tipo_usuario;
    const token = signToken({ correo, tipoUsuario });

    const update = await request(app)
      .patch(`/api/v1/auth/recuperarcontrasena/${token}`)
      .send({ contrasena: 'Nueva123' });
    expect(update.status).toBe(200);
    expect(update.body).toEqual({
      message: 'Confraseña actualizada correctamente',
      status: 200,
    });

    const badRequest = await request(app)
      .patch(`/api/v1/auth/recuperarcontrasena/`)
      .send({ contrasena: 'Nueva123' });
    expect(badRequest.status).toBe(404);

    const badRequest2 = await request(app)
      .patch(`/api/v1/auth/recuperarcontrasena/123`)
      .send({ contrasena: 'Nueva123' });
    expect(badRequest2.status).toBe(403);

    const badRequest3 = await request(app)
      .patch(`/api/v1/auth/recuperarcontrasena/${token}`)
      .send({ password: 'Nueva123' });
    expect(badRequest3.status).toBe(500);
  });
});
