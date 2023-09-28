import { prisma } from "../../../database.js";
import { ProductosSchema, fields } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";
import { uploadFiles } from "../../../uploadsPhotos/uploads.js";
import fs from "fs";
import { filtrarProductosPorCalificacion } from "./utils.js";

/**
 * Controlador para Crear un producto
 *
 */

export const create = async (req, res, next) => {
  const { body = {}, decoded = {} } = req;
  const files = req.files;
  // eslint-disable-next-line camelcase
  const { userType, idType: id_empresa } = decoded;

  // if (userType !== "Empresa") {
  //   return res.status(401).json({
  //     error: "No autorizado",
  //   });
  // }

  try {
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

    const resultCategoria = await prisma.categoria.findMany({
      where: {
        nombre_categoria: body.nombre_categoria,
      },
    });

    if (resultCategoria.length === 0) {
      return res.status(404).json({
        error: "Hay un problema con la Categoria",
      });
    }

    const Idcategoria = resultCategoria[0].id;
    const promises = files.map((file) => uploadFiles(file.path));
    const resultados = await Promise.all(promises);
    const fotosCloudinary = [];
    for (let i = 0; i < files.length; i++) {
      fotosCloudinary.push({ url_foto: resultados[i].url });
    }

    files.forEach((file) => fs.unlinkSync(file.path));

    delete data.nombre_categoria;

    const result = await prisma.producto.create({
      data: {
        ...data,
        fotos: { create: fotosCloudinary },
        // eslint-disable-next-line camelcase
        id_empresa: "40b0ea74-25e6-4566-8017-49a591c5b843",
        id_categoria: Idcategoria,
      },

      select: {
        id: true,
        nombre: true,
        descripcion: true,
        ficha_tecnica: true,
        precio: true,
        cantidad_disponible: true,
        estatus: true,
        tipo_entrega: true,
        marca: true,
        impuestos: true,
        fecha_creacion: true,
        empresa: { select: { razon_social: true } },

        categoria: {
          select: {
            nombre_categoria: true,
          },
        },
        fotos: true,
        valoraciones: true,
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
          empresa: {
            select: {
              razon_social: true,
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
              contains: keyword,
              mode: "insensitive",
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
          empresa: {
            select: {
              razon_social: true,
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

export const myProducts = async (req, res, next) => {
  const { decoded = {} } = req;

  // eslint-disable-next-line camelcase
  const { userType, idType: id_empresa } = decoded;

  if (userType !== "Empresa") {
    return res.status(401).json({
      error: "No autorizado",
    });
  }
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
        where: {
          // eslint-disable-next-line camelcase
          id_empresa,
        },
      }),
      prisma.producto.count({
        where: {
          // eslint-disable-next-line camelcase
          id_empresa,
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
        empresa: {
          select: {
            razon_social: true,
          },
        },
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
  const { body = {}, decoded = {}, params = {} } = req;
  const { id } = params;
  const files = req.files;
  // eslint-disable-next-line camelcase
  const { userType } = decoded;

  if (userType !== "Empresa") {
    return res.status(401).json({
      error: "No autorizado",
    });
  }

  try {
    const { success, data, error } =
      await ProductosSchema.partial().safeParseAsync({
        ...body,
        ...(body.precio ? { precio: parseInt(body.precio) } : {}),
        ...(body.cantidad_disponible
          ? { cantidad_disponible: parseInt(body.cantidad_disponible) }
          : {}),
        ...(body.estatus ? { estatus: Boolean(body.estatus) } : {}),
        ...(body.impuestos ? { impuestos: parseFloat(body.impuestos) } : {}),
      });

    if (!success) {
      return next({
        message: "Validation error",
        status: 400,
        error,
      });
    }
    let newData = { ...data };

    if (body.nombre_categoria) {
      const resultCategoria = await prisma.categoria.findMany({
        where: {
          nombre_categoria: body.nombre_categoria,
        },
      });

      if (resultCategoria.length > 0) {
        const Idcategoria = resultCategoria[0].id;
        newData = { ...newData, id_categoria: Idcategoria };
        delete newData.nombre_categoria;
      } else
        return res.status(404).json({
          error: "Hay un problema con la Categoria",
        });
    }

    if (files.length > 0) {
      const promises = files.map((file) => uploadFiles(file.path));
      const resultados = await Promise.all(promises);

      const fotosCloudinary = [];
      for (let i = 0; i < files.length; i++) {
        fotosCloudinary.push({ url_foto: resultados[i].url });
      }

      files.forEach((file) => fs.unlinkSync(file.path));
      newData = {
        ...newData,
        fotos: { deleteMany: {}, create: fotosCloudinary },
      };
    }

    const result = await prisma.producto.update({
      where: {
        id,
      },
      data: {
        ...newData,
        fecha_actualizacion: new Date().toISOString(),
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

/**
 * Controlador para traer productos con filtros
 */

export const filter = async (req, res, next) => {
  const {
    filterCategorias,
    filterCalificacion,
    filterMarcas,
    filterAlmacen,
    precioMin,
    precioMax,
  } = req.query;

  const categorias = filterCategorias ? filterCategorias.split("-") : [];
  const calificaciones = filterCalificacion
    ? filterCalificacion.split("-").map(Number)
    : [];
  const marcas = filterMarcas ? filterMarcas.split("-") : [];
  const almacenes = filterAlmacen ? filterAlmacen.split("-") : [];
  const precioI = precioMin ? Number(precioMin) : 0;
  const precioF = precioMax ? Number(precioMax) : 0;

  const { query } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });

  try {
    const where = {};

    // uso la relacion existente entre servicio y categoria para filtrar por categorias
    if (categorias.length > 0) {
      where.categoria = {
        nombre_categoria: {
          in: categorias,
        },
      };
    }
    if (marcas.length > 0) {
      where.marca = {
        in: marcas,
      };
    }
    if (almacenes.length > 0) {
      where.empresa = {
        razon_social: {
          in: almacenes,
        },
      };
    }
    if (precioI > 0 && precioF > 0) {
      where.precio = {
        gte: precioI,
        lte: precioF,
      };
    }

    const [result, total] = await Promise.all([
      prisma.producto.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        include: {
          empresa: {
            select: {
              razon_social: true,
            },
          },
          fotos: true,
          valoraciones: true,
          categoria: {
            select: {
              nombre_categoria: true,
            },
          },
        },
        where,
      }),
      prisma.producto.count({ where }),
    ]);

    // Filtrar productos por calificacion o retornar todos los productos

    const productosFiltrados =
      calificaciones.length > 0
        ? filtrarProductosPorCalificacion(result, filterCalificacion)
        : undefined;

    res.json({
      data: productosFiltrados ? productosFiltrados : result,
      meta: {
        limit,
        offset,
        total: productosFiltrados ? productosFiltrados.length : total,
        orderBy,
        direction,
      },
    });
  } catch (error) {
    next(error);
  }
};
