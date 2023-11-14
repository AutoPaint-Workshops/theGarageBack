import merge from 'lodash/merge.js';
import ordenProducto from './Orden_Productos/docs.json' assert { type: 'json' };
import autenticacion from './auth/docs.json' assert { type: 'json' };
import perfil from './perfil/docs.json' assert { type: 'json' };
import productos from './productos/docs.json' assert { type: 'json' };
import valoraciones from './valoraciones/docs.json' assert { type: 'json' };
import consultas from './consultas/docs.json' assert { type: 'json' };
import chat from './conversaciones/docs.json' assert { type: 'json' };

export const swaggerDefinition = merge(
  {
    openapi: '3.0.0',
    info: {
      title: 'The Garage API',
      version: '1.0.0',
      description: `API para el proyecto THE GARAGE APP, es una aplicación web desarrollada con nodeJs + express, que se conecta a una base de datos con prisma + postgreSQL. La API permite al frontend interactuar con las funcionalidades del sistema, que incluyen la creación de cuentas con diferentes roles (cliente, empresa y administrador), la autenticación de los usuarios, el manejo de los productos que las empresas publican en la plataforma, el procesamiento de los pagos y el chat entre los usuarios. La API está diseñada para ser segura, escalable y fácil de usar, siguiendo las mejores prácticas de desarrollo web.`,
    },
    servers: [
      {
        url: `${process.env.API_URL}/v1`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para registro e inicio de sesión',
      },
      {
        name: 'Perfil',
        description: 'Endpoints para consulta de perfil y actualizaciones',
      },

      {
        name: 'Productos',
        description: 'Endpoints para productos',
      },
      {
        name: 'Valoraciones',
        description: 'Endpoints para valoraciones',
      },
      {
        name: 'Ordenes de Productos',
        description: 'Endpoints para orden de Productos',
      },
      {
        name: 'Consultas',
        description: 'Endpoints para consultas o PQR',
      },
      {
        name: 'Chat',
        description: 'Endpoints para conversaciones',
      },
    ],
  },
  autenticacion,
  perfil,
  productos,
  valoraciones,
  ordenProducto,
  consultas,
  chat,
);
