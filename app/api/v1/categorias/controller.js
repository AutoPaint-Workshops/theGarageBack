import { prisma } from "../../../database.js";
import { fields } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";

export const create = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const result = await prisma.categoria.create({
      data: body,
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

  try {
    const [result, total] = await Promise.all([
      prisma.categoria.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        include: {
          productos: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      }),
      prisma.categoria.count(),
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
    const result = await prisma.categoria.findUnique({
      where: {
        id: params.id,
      },
    });

    if (result === null) {
      next({
        message: "category not found",
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
    const result = await prisma.categoria.update({
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
    await prisma.categoria.delete({
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
