import { prisma } from '../../../database.js';
import { fields } from './model.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';
import { response } from 'express';

export const getAllAdmin = async (offset, limit, orderBy, direction, date) => {
  const [result] = await Promise.all([
    prisma.orden_Productos.findMany({
      skip: offset,
      take: limit,

      orderBy: {
        [orderBy]: direction,
      },
      include: {
        detalle_orden_productos: {
          select: {
            id_producto: true,
            cantidad: true,
            precio_unitario: true,
          },
        },
      },
    }),
    prisma.orden_Productos.count(),
  ]);

  const orderWithProducts = await Promise.all(
    result.map(async (orden) => {
      const { usuario } = await prisma.cliente.findUnique({
        where: {
          id: orden.id_cliente,
        },
        include: {
          usuario: {
            select: {
              url_foto: true,
            },
          },
        },
      });
      const { usuario: empresa } = await prisma.empresa.findUnique({
        where: {
          id: orden.id_empresa,
        },
        include: {
          usuario: {
            select: {
              url_foto: true,
            },
          },
        },
      });
      const estados = await prisma.estados_Orden_Productos.findMany({
        where: {
          id_orden_productos: orden.id,
        },
        select: {
          estado: true,
          fecha_estado: true,
        },
        orderBy: {
          [orderBy]: date,
        },
      });

      const valores = await Promise.all(
        orden.detalle_orden_productos.map(async (detalle) => {
          const { nombre, descripcion, fotos, id_empresa } =
            await prisma.producto.findUnique({
              where: {
                id: detalle.id_producto,
              },
              include: {
                fotos: {
                  select: {
                    url_foto: true,
                  },
                },
              },
            });

          return { ...detalle, nombre, descripcion, fotos, id_empresa };
        }),
      );

      const { url_foto: foto_cliente } = usuario;
      const { url_foto: foto_empresa } = empresa;
      return {
        foto_cliente,
        foto_empresa,
        ...orden,
        estados,
        detalle_orden_productos: valores,
      };
    }),
  );
  return {
    data: orderWithProducts,
    meta: {
      limit,
      offset,
      orderBy,
      direction,
    },
  };
};

export const getAll = async (
  offset,
  limit,
  orderBy,
  direction,
  date,
  idType,
  userType,
) => {
  let result;
  if (userType === 'Cliente') {
    const [response] = await Promise.all([
      prisma.orden_Productos.findMany({
        where: {
          id_cliente: idType,
        },
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        include: {
          detalle_orden_productos: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
            },
          },
        },
      }),
      prisma.orden_Productos.count(),
    ]);
    result = response;
  } else if (userType === 'Empresa') {
    const [response] = await Promise.all([
      prisma.orden_Productos.findMany({
        where: {
          id_empresa: idType,
        },
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        include: {
          detalle_orden_productos: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
            },
          },
        },
      }),
      prisma.orden_Productos.count(),
    ]);
    result = response;
  } else {
    return;
  }

  const orderWithProducts = await Promise.all(
    result.map(async (orden) => {
      const { usuario } = await prisma.cliente.findUnique({
        where: {
          id: orden.id_cliente,
        },
        include: {
          usuario: {
            select: {
              url_foto: true,
            },
          },
        },
      });
      const { usuario: empresa } = await prisma.empresa.findUnique({
        where: {
          id: orden.id_empresa,
        },
        include: {
          usuario: {
            select: {
              url_foto: true,
            },
          },
        },
      });
      const estados = await prisma.estados_Orden_Productos.findMany({
        where: {
          id_orden_productos: orden.id,
        },
        select: {
          estado: true,
          fecha_estado: true,
        },
        orderBy: {
          [orderBy]: date,
        },
      });

      const valores = await Promise.all(
        orden.detalle_orden_productos.map(async (detalle) => {
          const { nombre, descripcion, fotos, id_empresa } =
            await prisma.producto.findUnique({
              where: {
                id: detalle.id_producto,
              },
              include: {
                fotos: {
                  select: {
                    url_foto: true,
                  },
                },
              },
            });

          return { ...detalle, nombre, descripcion, fotos, id_empresa };
        }),
      );

      const { url_foto: foto_cliente } = usuario;
      const { url_foto: foto_empresa } = empresa;
      return {
        foto_cliente,
        foto_empresa,
        ...orden,
        estados,
        detalle_orden_productos: valores,
      };
    }),
  );
  return {
    data: orderWithProducts,
    meta: {
      limit,
      offset,
      orderBy,
      direction,
    },
  };
};

export const updateStock = async (idOrden, method = 'substract') => {
  let resultCant = 0;
  let resultado = 0;
  let res = 0;
  let estatus = true;

  try {
    const estadoPago = await prisma.pagos.findUnique({
      where: {
        id_orden_productos: idOrden,
      },
      select: {
        estado: true,
      },
    });
    if (estadoPago.estado.length !== 'Rechazada') {
      const detalles = await prisma.detalle_Orden_Productos.findMany({
        where: {
          id_orden_productos: idOrden,
        },
      });
      detalles.map(async (detalle) => {
        resultCant = await prisma.Producto.findUnique({
          where: {
            id: detalle.id_producto,
          },
          select: {
            cantidad_disponible: true,
          },
        });

        if (method === 'add') {
          res = resultCant.cantidad_disponible + detalle.cantidad;
        } else {
          res = resultCant.cantidad_disponible - detalle.cantidad;
        }

        if (res === 0) {
          estatus = false;
        }

        resultado = await prisma.Producto.update({
          where: {
            id: detalle.id_producto,
          },
          data: {
            cantidad_disponible: res,
            estatus,
          },
        });
      });
    }
  } catch (error) {
    return error;
  }
};
