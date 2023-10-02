import { faker } from "@faker-js/faker";

export const getUser = (overrides = {}) => {
  const correo = faker.internet.email();
  const contrasena = "Contra123456";
  const tipo_usuario = "Cliente";
  const url_foto = "https://fotocliente.png";
  const departamento = "Antioquia";
  const ciudad = "Medellín";
  const direccion = "Calle 6a # 78-34";
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
        tipo_documento: "Cédula de Ciudadanía",
        numero_documento: "10903217652",
        telefono: "3213718930",
      },
    },
    overrides
  );
};

export const getCompany = (overrides = {}) => {
  const correo = faker.internet.email();
  const contrasena = "Contra123456";
  const tipo_usuario = "Empresa";

  const departamento = "Antioquia";
  const ciudad = "Medellín";
  const direccion = "Calle 6a # 78-34";
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
        razon_social: "todoautos sas",
        tipo_documento_empresa: "NIT",
        numero_documento_empresa: "10903217652",
        telefono: "3213718930",
        sitio_web: "https://www.google.com",
        representante_legal: faker.person.fullName(),
        tipo_documento_representante: "Cédula de Ciudadanía",
        numero_documento_representante: "1090396866",
        correo_representante: faker.internet.email(),
        descripcion: faker.lorem.paragraph(),
      },
    },
    overrides
  );
};
