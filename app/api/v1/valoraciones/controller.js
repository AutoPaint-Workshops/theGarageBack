import { prisma } from '../../../database.js';
import { ValoracionSchema, fields } from './model.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';

// =========================================
// * Crear una Valoracion
// =========================================

export const create = async (req, res, next) => {
  const { body = {}, decoded = {}, params } = req;
  // eslint-disable-next-line camelcase
  const { userType, idType: id_cliente } = decoded;
  // eslint-disable-next-line camelcase
  const { productId: id_producto } = params;

  if (userType !== 'Cliente') {
    return res.status(401).json({
      error: 'No autorizado',
    });
  }

  try {
    const { success, data, error } = await ValoracionSchema.safeParseAsync(
      body,
    );
    if (!success) {
      return next({
        message: 'Validation error',
        status: 400,
        error,
      });
    }

    const result = await prisma.valoracion.create({
      // eslint-disable-next-line camelcase
      data: { ...data, id_cliente, id_producto },
      include: {
        cliente: {
          select: {
            id: true,
            nombre_completo: true,
          },
        },
      },
    });

    res.status(201);
    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================
// * Obtener todas las valoraciones de un producto, o todas las valoraciones existentes en la tabla
// =========================================

export const all = async (req, res, next) => {
  const { query, params } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });
  const { productId } = params;

  try {
    let whereCondition = {
      id_producto: productId,
    };

    // *  Si productId es indefinido, no aplicamos la condición al where

    if (productId === undefined) {
      whereCondition = {};
    }

    const [result, total] = await Promise.all([
      prisma.valoracion.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        include: {
          cliente: {
            select: {
              nombre_completo: true,
              usuario: {
                select: {
                  url_foto: true,
                },
              },
            },
          },

          producto: {
            select: {
              nombre: true,
            },
          },
        },
        where: whereCondition,
      }),

      // * Para contar solo las valoraciones de un producto en especifico.
      prisma.valoracion.count({
        where: whereCondition,
      }),
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

// =========================================
// * Obtener una valoracion por su id para luego leerla, actualizarla o eliminarla.
// =========================================

export const id = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const result = await prisma.valoracion.findUnique({
      where: {
        id: params.id,
      },
    });

    if (result === null) {
      next({
        message: 'rating not found',
        status: 404,
      });
    } else {
      req.result = result;
      next();
    }
  } catch (error) {
    next(error);
  }
};

// =========================================
// * Ver una valoracion por su Id
// =========================================
export const read = async (req, res, next) => {
  res.json({
    data: req.result,
  });
};

// =========================================
// * Actualizar una valoracion por su Id
// =========================================

export const update = async (req, res, next) => {
  const { body = {}, params = {} } = req;
  const { id } = params;

  try {
    const result = await prisma.valoracion.update({
      where: {
        id,
      },
      data: {
        ...body,
        // updatedAt: new Date().toISOString(),
      },
    });

    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================
// * Eliminar una valoracion por su Id
// =========================================

export const remove = async (req, res) => {
  const { params = {} } = req;
  const { id } = params;

  try {
    await prisma.valoracion.delete({
      where: { id },
    });

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};
