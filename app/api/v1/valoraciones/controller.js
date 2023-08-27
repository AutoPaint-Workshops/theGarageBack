import { prisma } from "../../../database.js";
import { fields } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";

export const create = async (req, res, next) => {
  const { body = {}, decoded = {} } = req;
  // eslint-disable-next-line camelcase
  const { userType, idType: id_cliente } = decoded;

  if (userType !== "Cliente") {
    return res.status(401).json({
      error: "No autorizado",
    });
  }

  try {
    const result = await prisma.valoracion.create({
      // eslint-disable-next-line camelcase
      data: { ...body, id_cliente },
    });

    res.status(201);
    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const all = async (req, res, next) => {
  const { query, params } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });
  const { productId } = params;
  console.log(productId);

  try {
    let whereCondition = {
      OR: [{ id_producto: productId }, { id_servicio: productId }],
    };

    // Si productId es indefinido, no aplicamos la condición al where
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
          producto: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        where: whereCondition,
      }),
      prisma.valoracion.count(),
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
    const result = await prisma.valoracion.findUnique({
      where: {
        id: params.id,
      },
    });

    if (result === null) {
      next({
        message: "rating not found",
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

export const read = async (req, res, next) => {
  res.json({
    data: req.result,
  });
};

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
