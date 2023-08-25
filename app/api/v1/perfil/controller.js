import { prisma } from '../../../database.js';
import { fields } from './model.js';

export const id = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const result = await prisma.usuario.findUnique({
      where: {
        id: params.id,
      },
      include: {
        cliente: true,
        empresa: true,
      },
    });

    req.result = result;

    next();
  } catch (error) {
    next(error);
  }
};

export const read = async (req, res, next) => {
  res.json({
    data: req.result,
  });
};

export const update = async (req, res, next) => {
  const { body = {}, decoded = {} } = req;
  const { id } = decoded;

  try {
    const { tipo, data } = body;
    if (tipo === 'usuario') {
      const result = await prisma.usuario.update({
        where: {
          id,
        },
        include: {
          cliente: true,
          empresa: true,
        },
        data: {
          ...data,
          fecha_actualizacion: new Date().toISOString(),
        },
      });

      res.json({
        data: result,
      });
    }

    if (tipo === 'cliente') {
      const result = await prisma.cliente.update({
        where: {
          id_usuario: id,
        },
        data: {
          ...data,
        },
      });

      res.json({
        data: result,
      });
    }

    if (tipo === 'empresa') {
      const result = await prisma.empresa.update({
        where: {
          id_usuario: id,
        },
        data: {
          ...data,
        },
      });

      res.json({
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res) => {
  const { params = {} } = req;
  const { id } = params;

  try {
    await prisma.usuario.delete({
      where: { id },
    });

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};
