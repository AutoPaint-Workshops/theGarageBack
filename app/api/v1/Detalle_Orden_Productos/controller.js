import { prisma } from '../../../database.js';
import { fields } from './model.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';
/*
export const create = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const result = await prisma.detalle_Orden_Productos.create({
      data: body,
    });

    res.status(201);
    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};*/

export const all = async (req, res, next) => {
  const { query } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });

  try {
    const [result, total] = await Promise.all([
      prisma.detalle_Orden_Productos.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
      }),
      prisma.detalle_Orden_Productos.count(),
    ]);

    res.json({
      data: result,
      meta: {
        limit,
        offset,
        total,
        orderBy,
        direction,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const id = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const result = await prisma.detalle_Orden_Productos.findUnique({
      where: {
        id: params.id,
      },
    });

    req.result = result;

    next();
  } catch (error) {
    next(error);
  }
};

export const idOrden = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const result = await prisma.detalle_Orden_Productos.findMany({
      where: {
        id_orden_productos: params.id_orden,
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
