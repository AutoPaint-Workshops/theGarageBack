import request from 'supertest';
import { app } from '../../index.js';
import { resetDb } from '../helpers/reset-db.js';

import { setup } from '../helpers/userCompanySetup.js';
import { setupV } from '../helpers/valoratiosnOrderSetup.js';

import {
  getIncorrectDataProduct,
  getPartialProduct,
  getProduct,
} from './fixtures/product.fixture.js';

describe('Categorys Test', () => {
  beforeEach(async () => {
    await resetDb();
  });
  test('Create Category', async () => {
    const result = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(result.status).toBe(201);
  });

  test('Create bad structure Category', async () => {
    const result = await request(app).post('/api/v1/categorias').send({
      nombre: 'Pinturas',
    });

    expect(result.status).toBe(500);
  });

  test('GetAll Categorys', async () => {
    await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    const response = await request(app).get('/api/v1/categorias');
    expect(response.body.data.length).toBe(1);
  });

  test('Get Category by id', async () => {
    const result = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    const response = await request(app).get(
      `/api/v1/categorias/${result.body.data.id}`,
    );
    expect(response.status).toBe(200);
  });

  test('update Category', async () => {
    const result = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    const response = await request(app)
      .put(`/api/v1/categorias/${result.body.data.id}`)
      .send({
        nombre_categoria: 'Nueva Categoria',
      });

    expect(response.status).toBe(200);
  });

  test('Delete Category', async () => {
    const result = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    const response = await request(app).delete(
      `/api/v1/categorias/${result.body.data.id}`,
    );
    expect(response.status).toBe(204);
  });
});

describe('Products Test', () => {
  beforeEach(async () => {
    await resetDb();
  });

  test('Create Product and GetAll', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());

    expect(responseProduct.status).toBe(201);
    const listProduct = await request(app).get('/api/v1/productos');
    expect(listProduct.body.data.length).toBe(1);
  }, 10000);
  test('Create Product with incorrect data', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getIncorrectDataProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());

    expect(responseProduct.status).toBe(400);
  }, 10000);

  test('Get Product by ID', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());

    expect(responseProduct.status).toBe(201);

    const productId = responseProduct.body.data.id;

    const response = await request(app)
      .get(`/api/v1/productos/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);

    expect(response.body.data.id).toBe(productId);
  }, 10000);

  test('Get Product by Incorrect ID', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());

    expect(responseProduct.status).toBe(201);

    const productId = 'e258b309-c5db-45ea-ba0f-aa0e10f2272f';

    const response = await request(app)
      .get(`/api/v1/productos/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
  }, 10000);

  test('Update Product and Get my products', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());
    expect(responseProduct.status).toBe(201);

    const productId = responseProduct.body.data.id;
    const dataUpdate = getPartialProduct();

    const response = await request(app)
      .put(`/api/v1/productos/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataUpdate.getBoundary()}`,
      )
      .send(dataUpdate.getBuffer());
    expect(response.status).toBe(200);
    expect(response.body.data.nombre).toBe('ProductoAtualizado');

    const responseMyProducts = await request(app)
      .get('/api/v1/productos/misProductos')
      .set('Authorization', `Bearer ${token}`);

    expect(responseMyProducts.body.data.length).toBe(1);
  }, 10000);

  test('Delete Product', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());
    expect(responseProduct.status).toBe(201);

    const productId = responseProduct.body.data.id;

    const response = await request(app)
      .delete(`/api/v1/productos/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(204);
  }, 10000);

  test('Search Product', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());
    expect(responseProduct.status).toBe(201);

    const productName = responseProduct.body.data.nombre;

    const response = await request(app)
      .get(`/api/v1/productos/search/${productName}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.data[0].nombre).toBe('ProductTest');
  }, 10000);

  test('Filter Product', async () => {
    await setup();
    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const category = await request(app).post('/api/v1/categorias').send({
      nombre_categoria: 'Pinturas',
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post('/api/v1/productos')
      .set('Authorization', `Bearer ${token}`)
      .set(
        'Content-Type',
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`,
      )
      .send(dataProduct.getBuffer());
    expect(responseProduct.status).toBe(201);

    const response = await request(app)
      .get(`/api/v1/productos/filter?filterCategoria=Pinturas`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.data[0].categoria.nombre_categoria).toBe('Pinturas');
  }, 10000);
});

describe('Valorations Test', () => {
  beforeEach(async () => {
    await resetDb();
  });

  test('Create Valoration and GetAll', async () => {
    await setupV();

    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_ser@example.com',
      contrasena: 'Contra123456',
    });

    expect(login.status).toBe(200);
    const token = login.body.meta.token;

    const product = await request(app).get('/api/v1/productos/');
    const idProduct = product.body.data[0].id;

    const responseValoration = await request(app)
      .post(`/api/v1/productos/${idProduct}/valoraciones`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        calificacion: 5,
        comentarios: 'Excelente producto',
      });

    expect(responseValoration.status).toBe(201);
    const listValoration = await request(app).get(
      `/api/v1/productos/${idProduct}/valoraciones`,
    );
    expect(listValoration.body.data.length).toBe(1);
  }, 20000);

  test('Fail Create valoration for company', async () => {
    await setupV();

    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_empresa@example.com',
      contrasena: 'Contra123456',
    });
    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const product = await request(app).get('/api/v1/productos/');
    const idProduct = product.body.data[0].id;

    const responseValoration = await request(app)
      .post(`/api/v1/productos/${idProduct}/valoraciones`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        calificacion: 5,
        comentarios: 'Excelente producto',
      });

    expect(responseValoration.status).toBe(404);
  }, 20000);

  test('Get ALL valorations', async () => {
    await setupV();

    const login = await request(app).post('/api/v1/auth/signin').send({
      correo: 'correo_ser@example.com',
      contrasena: 'Contra123456',
    });
    expect(login.status).toBe(200);
    const token = login.body.meta.token;
    const product = await request(app).get('/api/v1/productos/');
    const idProduct = product.body.data[0].id;

    const responseValoration = await request(app)
      .post(`/api/v1/productos/${idProduct}/valoraciones`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        calificacion: 5,
        comentarios: 'Excelente producto',
      });

    expect(responseValoration.status).toBe(201);
    const result = await request(app).get(`/api/v1/valoraciones`);
    expect(result.body.data.length).toBe(1);
  }, 20000);
});
