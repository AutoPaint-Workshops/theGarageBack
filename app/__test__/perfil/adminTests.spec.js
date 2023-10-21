import request from 'supertest';
import { describe, expect, test } from 'vitest';
import FormData from 'form-data';

import { app } from '../../index.js';
import { resetDb } from '../helpers/reset-db.js';
import { getAdminUser, getUsers } from '../helpers/createProfiles.js';
import { getAuth } from '../helpers/getAuth.js';

describe('Admin functions tests', () => {
  beforeEach(async () => {
    await resetDb();
  });

  test('Get all users, clients and companies', async () => {
    const admin = await getAdminUser();

    const cliente = await getUsers('cliente');
    await getUsers('cliente');
    await getUsers('empresa');
    await getUsers('empresa');

    const token = getAuth(admin);
    const token2 = getAuth(cliente);

    const responseClients = await request(app)
      .get('/api/v1/perfil/usuarios/Cliente')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(responseClients.body.data.length).toBeGreaterThan(1);

    const responseCompanys = await request(app)
      .get('/api/v1/perfil/usuarios/Empresa')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(responseCompanys.body.data.length).toBeGreaterThan(1);

    await request(app)
      .get('/api/v1/perfil/usuarios/Cliente')
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);

    const allUsers = await request(app)
      .get('/api/v1/perfil/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(allUsers.body.data.length).toBeGreaterThan(1);

    const allCompanys = await request(app)
      .get('/api/v1/perfil/empresas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  }, 10000);

  test('Get user by id', async () => {
    const admin = await getAdminUser();
    const cliente = await getUsers('cliente');
    const company = await getUsers('empresa');
    const token = getAuth(admin);

    const resClient = await request(app)
      .get(`/api/v1/perfil/${cliente.userData.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const resCompany = await request(app)
      .get(`/api/v1/perfil/${company.userData.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('Update user by id', async () => {
    const admin = await getAdminUser();
    const cliente = await getUsers('cliente');
    const company = await getUsers('empresa');
    const token = getAuth(admin);
    const token2 = getAuth(cliente);
    const id_client = cliente.userData.id;
    const id_company = company.userData.id;

    const data = {
      userData: {
        estatus: 'Bloqueado',
      },
      userTypeData: {
        telefono: '123456789',
      },
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));

    const resClient = await request(app)
      .put(`/api/v1/perfil/${id_client}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send(formData.getBuffer())
      .expect(200);

    const resCompany = await request(app)
      .put(`/api/v1/perfil/${id_company}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send(formData.getBuffer())
      .expect(200);

    const badRequest = await request(app)
      .put(`/api/v1/perfil/${id_company}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token2}`)
      .send(formData.getBuffer())
      .expect(403);
    expect(badRequest.body).toEqual({
      error: { message: 'Prohibido', status: 403 },
    });

    const formData2 = new FormData();
    formData2.append('data', JSON.stringify({}));

    const nothingToDo = await request(app)
      .put(`/api/v1/perfil/${id_company}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData2.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send(formData2.getBuffer())
      .expect(400);
    expect(nothingToDo.body).toEqual({
      error: { message: 'Nada que actualizar', status: 400 },
    });

    const data2 = {
      userData: {
        estatus: 'Rechazado',
      },
    };

    const formData3 = new FormData();
    formData3.append('data', JSON.stringify(data2));

    const rejected = await request(app)
      .put(`/api/v1/perfil/${id_company}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData3.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send(formData3.getBuffer())
      .expect(200);
    expect(rejected.body).toEqual({
      error: { message: 'Usuario eliminado', status: 200 },
    });

    const data3 = {
      userData: {
        estatus: 'Activo',
      },
    };

    const formData4 = new FormData();
    formData4.append('data', JSON.stringify(data3));

    const active = await request(app)
      .put(`/api/v1/perfil/${id_client}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${formData4.getBoundary()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send(formData4.getBuffer())
      .expect(200);
  }, 10000);
});
