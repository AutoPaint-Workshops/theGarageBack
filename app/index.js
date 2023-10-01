import express from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { router as api } from './api/v1/index.js';
import { swaggerDefinition } from './api/v1/docs.js';

export const app = express();

// CORS
app.use(cors());

// Parse JSON body
app.use(express.json());

app.use('/api', api);
app.use('/api/v1', api);

// docs

app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerDefinition));

// No route found handler
app.use((req, res, next) => {
  next({
    message: 'Route Not Found',
    status: 404,
  });
});

// Error handler
app.use((err, req, res, next) => {
  const { message = '', status = 500, error } = err;
  res.status(status);

  if (error instanceof z.ZodError) {
    res.json({
      // TODO: Filtro de errores
      ...error.issues,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // The .code property can be accessed in a type-safe manner
    if (error.code === 'P2002') {
      res.json({
        error: {
          message,
          status,
        },
      });
      return;
    }
    return res.json({
      error: {
        message,
        status,
        error,
      },
    });
  }
  res.json({
    error: {
      message,
      status,
      error,
    },
  });
});
