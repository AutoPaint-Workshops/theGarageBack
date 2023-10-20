import request from 'supertest';
import { describe, expect, test } from 'vitest';
import FormData from 'form-data';

import { app } from '../../index.js';
import { resetDb } from '../helpers/reset-db.js';
import { getClient, getCompany } from '../fixtures/fakerData.fixture.js';

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

  //const login = await request(app).post('/api/v1/auth/signin').send({
  //     correo: result.userData.correo,
  //     contrasena: result.password,
  //   });
  //   expect(login.status).toBe(200);
  // const login = await request(app).post('/api/v1/auth/signin').send({
  //   correo: data.userData.correo,
  //   contrasena: 'Contra123456',
  // });
  // expect(login.status).toBe(200);

  // beforeEach(async () => {
  //   await resetDb();
  // });
  // beforeEach(async () => {
  //   await resetDb();
  // });

  // test('Signed Fail', async () => {
  //   const formData = new FormData();
  //   const binaryData = Buffer.from([
  //     0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  //   ]);

  //   const data = getClient();

  //   formData.append('data', JSON.stringify(data));
  //   formData.append('images', binaryData, { filename: 'imagen_simulada.png' });
  //   const response = await request(app)
  //     .post('/api/v1/auth/cliente/signup')
  //     .set(
  //       'Content-Type',
  //       `multipart/form-data; boundary=${formData.getBoundary()}`,
  //     )
  //     .send(formData.getBuffer());
  //   expect(response.status).toBe(201);

  //   const faillogin = await request(app).post('/api/v1/auth/signin').send({
  //     correo: data.userData.correo,
  //     contrasena: 'Contra12345x',
  //   });
  //   expect(faillogin.status).toBe(403);
  // });

  // test('Get All products succesfully ', async () => {
  //   const response = await request(app).get('/api/v1/productos');
  //   expect(response.status).toBe(200);
  // });
});
