import { faker } from '@faker-js/faker';
import FormData from 'form-data';

export const getClient = (overrides = {}) => {
  const correo = faker.internet.email().toLowerCase();
  const contrasena = 'Contra123456';
  const tipo_usuario = 'Cliente';
  const url_foto = faker.image.avatar();
  const departamento = 'Antioquia';
  const ciudad = 'Medellín';
  const direccion = faker.location.streetAddress(true);
  const numero_documento = faker.number
    .int({ min: 10000000, max: 999999999 })
    .toString();
  return Object.assign(
    {
      userData: {
        correo,
        contrasena,
        tipo_usuario,
        url_foto,
        departamento,
        ciudad,
        direccion,
      },
      userTypeData: {
        nombre_completo: faker.person.fullName(),
        tipo_documento: 'Cédula de Ciudadanía',
        numero_documento,
        telefono: '3213718930',
      },
    },
    overrides,
  );
};

export const getCompany = (overrides = {}) => {
  const correo = faker.internet.email().toLowerCase();
  const contrasena = 'Contra123456';
  const tipo_usuario = 'Empresa';
  const departamento = 'Antioquia';
  const ciudad = 'Medellín';
  const direccion = faker.location.streetAddress(true);
  const razon_social = faker.company.name();
  const numero_documento_empresa = faker.number
    .int({ min: 10000000, max: 999999999 })
    .toString();
  const numero_documento_representante = faker.number
    .int({ min: 10000000, max: 999999999 })
    .toString();

  return Object.assign(
    {
      userData: {
        correo,
        contrasena,
        tipo_usuario,
        departamento,
        ciudad,
        direccion,
      },
      userTypeData: {
        razon_social,
        tipo_documento_empresa: 'NIT',
        numero_documento_empresa,
        telefono: '3213718930',
        sitio_web: 'https://www.google.com',
        representante_legal: faker.person.fullName(),
        tipo_documento_representante: 'Cédula de Ciudadanía',
        numero_documento_representante,
        correo_representante: faker.internet.email().toLowerCase(),
        descripcion: faker.lorem.paragraph(),
      },
    },
    overrides,
  );
};

export const getAdmin = (overrides = {}) => {
  const correo = faker.internet.email().toLowerCase();
  const contrasena = 'Contra123456';
  const tipo_usuario = 'Administrador';
  const url_foto = faker.image.avatar();
  const departamento = 'Antioquia';
  const ciudad = 'Medellín';
  const direccion = faker.location.streetAddress(true);
  return Object.assign(
    {
      userData: {
        correo,
        contrasena,
        tipo_usuario,
        url_foto,
        departamento,
        ciudad,
        direccion,
      },
    },
    overrides,
  );
};

export const getProduct = (category = [], overrides = {}) => {
  const selectCategory = faker.helpers.arrayElement(category);
  const selectDelivery = faker.helpers.arrayElement([
    'Recoger en tienda',
    'Envío domicilio',
    'Recoger en tienda y Envío domicilio',
  ]);

  return Object.assign(
    {
      nombre_categoria: selectCategory,
      nombre: faker.commerce.productName(),
      descripcion: faker.commerce.productDescription(),
      ficha_tecnica: faker.commerce.productDescription(),
      impuestos: 19,
      precio: faker.number.int({ min: 100000, max: 1000000 }),
      cantidad_disponible: faker.number.int({ min: 1, max: 100 }),
      tipo_entrega: selectDelivery,
      marca: faker.company.name(),
      estatus: true,
    },
    overrides,
  );
};
