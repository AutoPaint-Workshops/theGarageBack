import merge from 'lodash/merge.js';
import productos from './productos/docs.json' assert { type: 'json' };
import valoraciones from './valoraciones/docs.json' assert { type: 'json' };
import autenticacion from './auth/docs.json' assert { type: 'json' };

export const swaggerDefinition = merge(
  {
    openapi: '3.0.0',
    info: {
      title: 'The Garage API',
      version: '1.0.0',
      description: 'API For the aplicacion The Garage',
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
        description: 'API for authentication process in the system',
      },
      {
        name: 'Productos',
        description: 'Endpoints para productos',
      },
      {
        name: 'Valoraciones',
        description: 'Endpoints para valoraciones',
      },
    ],
  },
  autenticacion,
  productos,
  valoraciones,
);
