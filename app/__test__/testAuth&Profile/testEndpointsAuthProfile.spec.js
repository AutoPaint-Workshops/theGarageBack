import request from 'supertest';
import { describe, expect, test } from 'vitest';
import FormData from 'form-data';

import { app } from '../../index.js';
import { resetDb } from '../helpers/reset-db.js';
import { getUsers, getAdminUser } from '../helpers/createProfiles.js';
import { getClient, getCompany } from '../fixtures/fakerData.fixture.js';
import {
  createCategories,
  createOrdersProducts,
  createProducts,
  addStateToOrder,
} from '../helpers/createProducts.js';
import { signToken } from '../../api/v1/auth.js';
import { getAuth } from '../helpers/getAuth.js';

describe('Testing auth and profile endpoints', () => {
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

  test('Create an order with productos', async () => {
    const cliente = await getUsers('cliente');
    const token = getAuth(cliente);
    const empresa = await getUsers('empresa');
    const id_empresa = empresa.userTypeData.id;
    const categorias = await createCategories();
    const producto1 = await createProducts(id_empresa, categorias);
    const producto2 = await createProducts(id_empresa, categorias);
    const total = producto1.precio + producto2.precio;
    const body = {
      ordenProductos: {
        total,
        id_empresa,
      },
      detallesOrdenProductos: [
        {
          id_producto: producto1.id,
          cantidad: 1,
          precio_unitario: producto1.precio,
        },
        {
          id_producto: producto2.id,
          cantidad: 1,
          precio_unitario: producto2.precio,
        },
      ],
    };
    const response = await request(app)
      .post('/api/v1/orden_productos')
      .set('Authorization', `Bearer ${token}`)
      .send(body);
    expect(response.status).toBe(200);
    expect(response.body.paymentUrl).toBeTruthy();

    const badRequest = await request(app)
      .post('/api/v1/orden_productos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ordenProductos: {},
        detallesOrdenProductos: [],
      });
    expect(badRequest.status).toBe(500);
  }, 10000);

  test('Create an order with bad productos quantyties', async () => {
    const cliente = await getUsers('cliente');
    const token = getAuth(cliente);
    const empresa = await getUsers('empresa');
    const id_empresa = empresa.userTypeData.id;
    const categorias = await createCategories();
    const producto1 = await createProducts(id_empresa, categorias);
    const total = producto1.precio * (producto1.cantidad_disponible + 1);
    const body = {
      ordenProductos: {
        total,
        id_empresa,
      },
      detallesOrdenProductos: [
        {
          id_producto: producto1.id,
          cantidad: producto1.cantidad_disponible + 1,
          precio_unitario: producto1.precio,
        },
      ],
    };
    const badRequest = await request(app)
      .post('/api/v1/orden_productos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ordenProductos: {},
        detallesOrdenProductos: [],
      });
    expect(badRequest.status).toBe(500);
  }, 10000);

  test('Find all the orders with products', async () => {
    const admin = await getAdminUser();
    const token = getAuth(admin);

    const cliente = await getUsers('cliente');
    const tokenCliente = getAuth(cliente);
    const cliente2 = await getUsers('cliente');
    await createOrdersProducts(cliente);
    await createOrdersProducts(cliente2);
    const all = await request(app)
      .get('/api/v1/orden_productos')
      .set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.data.length).toBe(2);
    const allCliente = await request(app)
      .get('/api/v1/orden_productos')
      .set('Authorization', `Bearer ${tokenCliente}`);
    expect(allCliente.status).toBe(200);
    expect(allCliente.body.data.length).toBe(1);
  });

  test('update order state', async () => {
    //  const admin = await getAdminUser();
    const empresa = await getUsers('empresa');
    const cliente = await getUsers('cliente');
    const tokenCliente = getAuth(cliente);
    const tokenEmpresa = getAuth(empresa);
    const orderPagada = await createOrdersProducts(cliente);
    const { result } = orderPagada;
    const { id } = result;

    const orderEnviada = await createOrdersProducts(cliente);
    const { result: resultEnviada } = orderEnviada;
    const { id: idEnviada } = resultEnviada;
    const resState = await addStateToOrder(idEnviada, 'Enviada');

    const estadoOrden = await request(app)
      .put(`/api/v1/orden_productos/${id}`)
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ estado: 'Cancelada' });
    expect(estadoOrden.status).toBe(200);
    expect(estadoOrden.body.message).toBe('Estado actualizado');

    const estadoOrdenPagada = await request(app)
      .put(`/api/v1/orden_productos/${id}`)
      .set('Authorization', `Bearer ${tokenEmpresa}`)
      .send({ estado: 'Enviada' });
    expect(estadoOrdenPagada.status).toBe(400);
    expect(estadoOrdenPagada.body.message).toBe(
      'No se pudo realizar el cambio de estado, la orden se encuentra cancelada',
    );

    const estadoOrdenEnviada = await request(app)
      .put(`/api/v1/orden_productos/${idEnviada}`)
      .set('Authorization', `Bearer ${tokenEmpresa}`)
      .send({ estado: 'Entregada' });
    expect(estadoOrdenEnviada.status).toBe(200);
    expect(estadoOrdenEnviada.body.message).toBe('Estado actualizado');
  }, 10000);
});
