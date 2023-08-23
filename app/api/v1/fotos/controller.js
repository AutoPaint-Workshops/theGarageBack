import { prisma } from "../../../database.js";
import { fields, FotoSchema } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";

export const create = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const { success, data, error } = await FotoSchema.safeParseAsync(body);
    if (!success) {
      return next({
        message: "Validation error",
        status: 400,
        error,
      });
    }
    const result = await prisma.foto.create({
      data: { ...data },
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

  // //OR//para que busque en id_producto o id_servicio

  try {
    const [result, total] = await Promise.all([
      prisma.foto.findMany({
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
        where: {
          OR: [{ id_producto: productId }, { id_servicio: productId }],
        },
      }),
      prisma.foto.count(),
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
    const result = await prisma.foto.findUnique({
      where: {
        id: params.id,
      },
    });

    if (result === null) {
      next({
        message: "Photo not found",
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
    const { success, data, error } = await FotoSchema.partial().safeParseAsync(
      body
    );
    if (!success) {
      return next({
        message: "Validator error",
        status: 400,
        error,
      });
    }

    const result = await prisma.foto.update({
      where: {
        id,
      },
      data: {
        ...data,
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
    await prisma.foto.delete({
      where: {
        id,
      },
    });

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};
