import { prisma } from "../../../database.js";
import { fields } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";

export const create = async (req, res, next) => {
  const { body = {}, decoded = {} } = req;
  // eslint-disable-next-line camelcase
  const { userType, idType: id_empresa } = decoded;

  if (userType !== "Empresa") {
    return res.status(401).json({
      error: "No autorizado",
    });
  }

  try {
    const result = await prisma.producto.create({
      // eslint-disable-next-line camelcase
      data: { ...body, fotos: { create: body.fotos }, id_empresa },
      // * fotos: { create: body.fotos } => Crea las fotos del producto y crea la relación con el producto
    });

    res.status(201);
    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  const { query, params } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });

  const { searchTerm } = params;

  const keywords = searchTerm.split("-");
  try {
    const [result, total] = await Promise.all([
      prisma.producto.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        include: {
          fotos: true,
          valoraciones: true,
          categoria: {
            select: {
              nombre_categoria: true,
            },
          },
        },
        where: {
          OR: keywords.map((keyword) => ({
            nombre: {
              contains: keyword, // Buscar coincidencias en el nombre
              mode: "insensitive", // Hacer la búsqueda insensible a mayúsculas/minúsculas
            },
          })),
        },
      }),
      prisma.producto.count({
        where: {
          OR: keywords.map((keyword) => ({
            nombre: {
              contains: keyword, // Buscar coincidencias en el nombre
              mode: "insensitive", // Hacer la búsqueda insensible a mayúsculas/minúsculas
            },
          })),
        },
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

export const all = async (req, res, next) => {
  const { query } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });

  try {
    const [result, total] = await Promise.all([
      prisma.producto.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        include: {
          fotos: true,
          valoraciones: true,
          categoria: {
            select: {
              nombre_categoria: true,
            },
          },
        },
      }),
      prisma.producto.count(),
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
    const result = await prisma.producto.findUnique({
      where: {
        id: params.id,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre_categoria: true,
          },
        },
        fotos: true,
        valoraciones: true,
      },
    });

    if (result === null) {
      return res.status(404).json({
        error: "Producto No encontrado",
      });
    } else {
      req.data = result;
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const read = async (req, res, next) => {
  res.json({
    data: req.data,
  });
};

export const update = async (req, res, next) => {
  const { body = {}, params = {} } = req;
  const { id } = params;

  try {
    const result = await prisma.producto.update({
      where: {
        id,
      },
      data: {
        ...body,
        fecha_actualizacion: new Date().toISOString(),
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
    await prisma.producto.delete({
      where: { id },
    });

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};
