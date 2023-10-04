/* eslint-disable camelcase */
import { prisma } from "../../../database.js";
import { fields } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";
import { mercadopagoCreateOrder } from "../mercadopago.config.js";

export const create = async (req, res, next) => {
  const { body = {}, decoded } = req;
  const { ordenProductos, detallesOrdenProductos } = body;
  const { idType } = decoded;
  let result;
  let reference;
  let resultEstado;
  const detallesImprmir = [];
  ordenProductos.id_cliente = idType;
  console.log("Encabezado", ordenProductos);
  try {
    await prisma.$transaction(async (transaction) => {
      // Inserta la factura
      result = await transaction.orden_Productos.create({
        data: ordenProductos,
      });
      console.log("Encabezado", result);
      resultEstado = await transaction.estados_Orden_Productos.create({
        data: {
          id_orden_productos: result.id,
          estado: "Creado",
        },
      });

      reference = result.id;
      await Promise.all(
        detallesOrdenProductos.map(async (detalle) => {
          const resultDetalle =
            await transaction.detalle_Orden_Productos.create({
              data: {
                id_orden_productos: result.id,
                ...detalle,
              },
            });

          detallesImprmir.push(resultDetalle);
        })
      );
    });
    const elementos = detallesOrdenProductos;
    try {
      const items = elementos.map(async (elemento) => {
        const result = await prisma.producto.findUnique({
          where: {
            id: elemento.id_producto,
          },
        });
        /*
        const photo = await prisma.foto.findFirst({
          where: {
            id_producto: elemento.id_producto,
          },
        });*/

        const item = {
          id: result.id,
          title: result.nombre,
          description: result.descripcion,
          // picture_url: photo.url_foto,
          unit_price: result.precio,
          currency_id: "COP",
          quantity: elemento.cantidad,
        };

        return item;
      });

      const resultItems = await Promise.all(items);
      // Si resultItems da error detener

      const orden = await mercadopagoCreateOrder(resultItems, reference);

      try {
        const resultPago = await prisma.Pagos.create({
          data: {
            id_cliente: idType,
            id_orden_productos: reference,
            url_pago: orden.body.init_point,
            estado: "creado",
          },
        });
        console.log(resultPago);
      } catch (error) {
        next(error);
      }

      res.json({ paymentUrl: orden.body.init_point });
    } catch (error) {
      // Borrar en cascada  los detalles de la orden

      next(error);
    }
    res.status(201);
  } catch (error) {
    console.error("Error en la transacción:", error);
    next(error);
  }
};

export const all = async (req, res, next) => {
  const { query } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction, date } = parseOrderParams({
    fields,
    ...query,
  });

  try {
    const [result] = await Promise.all([
      prisma.orden_Productos.findMany({
        skip: offset,
        take: limit,

        orderBy: {
          [orderBy]: direction,
        },
        // include: {
        //   cliente: {
        //     select: {
        //       nombre_completo: true,
        //     },
        //   },
        // },
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
          })
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
      })
    );

    res.json({
      data: orderWithProducts,
      meta: {
        limit,
        offset,
        orderBy,
        direction,
      },
    });
  } catch (error) {
    console.log("Error", error);
    next(error);
  }
};

export const id = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const result = await prisma.orden_Productos.findUnique({
      where: {
        id: params.id,
      },
      include: {
        detalle_orden_productos: true,
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
  const { body = {}, params = {} } = req;
  const { id } = params;

  try {
    const result = await prisma.orden_Productos.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });

    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
/*
export const remove = async (req, res) => {
  const { params = {} } = req;
  const { id } = params;

  try {
    await prisma.orden_Productos.delete({
      where: { id },
    });

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};*/

export const createOrder = async (req, res, next) => {
  const elementos = req.result.detalle_orden_productos;
  try {
    const items = elementos.map(async (elemento) => {
      const result = await prisma.producto.findUnique({
        where: {
          id: elemento.id_producto,
        },
      });

      const photo = await prisma.foto.findFirst({
        where: {
          id_producto: elemento.id_producto,
        },
      });

      const item = {
        id: result.id,
        title: result.nombre,
        description: result.descripcion,
        picture_url: photo.url_foto,
        unit_price: result.precio,
        currency_id: "COP",
        quantity: elemento.cantidad,
      };

      return item;
    });

    const resultItems = await Promise.all(items);

    const orden = await mercadopagoCreateOrder(resultItems);

    res.json(orden);
  } catch (error) {
    next(error);
  }
};
