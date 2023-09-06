import { prisma } from "../../../database.js";
import { ProductosSchema, fields } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";
import { uploadFiles } from "../../../uploadsPhotos/uploads.js";
import fs from "fs";

export const create = async (req, res, next) => {
  const { body = {}, decoded = {} } = req;
  const files = req.files;
  // eslint-disable-next-line camelcase
  const { userType, idType: id_empresa } = decoded;

  if (userType !== "Empresa") {
    return res.status(401).json({
      error: "No autorizado",
    });
  }

  try {
    // * Subo las fotos a cloudinary
    const promises = files.map((file) => uploadFiles(file.path));
    const resultados = await Promise.all(promises);

    // * Creo estructura de fotos para la base de datos
    const fotosCloudinary = [];
    for (let i = 0; i < files.length; i++) {
      fotosCloudinary.push({ url_foto: resultados[i].url });
    }

    // * Elimino las fotos del servidor temporales, ya no las necesito.
    files.forEach((file) => fs.unlinkSync(file.path));

    const { success, data, error } = await ProductosSchema.safeParseAsync({
      ...body,
      precio: parseInt(body.precio),
      cantidad_disponible: parseInt(body.cantidad_disponible),
      estatus: Boolean(body.estatus),
      impuestos: parseFloat(body.impuestos),
    });

    if (!success) {
      return next({
        message: "Validation error",
        status: 400,
        error,
      });
    }

    const result = await prisma.producto.create({
      data: {
        ...data,
        fotos: { create: fotosCloudinary },
        // eslint-disable-next-line camelcase
        id_empresa,
      },
      //   * fotos: { create: body.fotosCloudinary } => Crea las fotos del producto y crea la relación con el producto
    });
    res.status(201);
    res.json({
      data: result,
    });

    // res.json({ body, files });
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
