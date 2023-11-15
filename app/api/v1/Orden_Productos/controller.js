/* eslint-disable camelcase */
import _ from 'lodash';

import { prisma } from '../../../database.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';
import { emailStructure, transporter } from '../mailer.js';
import { mercadopagoCreateOrder } from '../mercadopago.config.js';
import { fields } from './model.js';
import { getAll, getAllAdmin, updateStock } from './utils.js';

export const create = async (req, res, next) => {
  const { body = {}, decoded } = req;
  const { ordenProductos, detallesOrdenProductos } = body;
  const { idType } = decoded;

  let result;
  let reference;
  let resultEstado;
  const detallesImprmir = [];
  ordenProductos.id_cliente = idType;

  try {
    await prisma.$transaction(async (transaction) => {
      // Inserta la factura
      result = await transaction.orden_Productos.create({
        data: ordenProductos,
      });
      resultEstado = await transaction.estados_Orden_Productos.create({
        data: {
          id_orden_productos: result.id,

          estado: 'Creado',
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
        }),
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
          currency_id: 'COP',
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
            estado: 'creado',
          },
        });
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
    next(error);
  }
};

export const all = async (req, res, next) => {
  const { query = {}, decoded } = req;
  const { id, idType, userType } = decoded;

  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction, date } = parseOrderParams({
    fields,
    ...query,
  });

  try {
    if (userType === 'Administrador') {
      const { data, meta } = await getAllAdmin(
        orderBy,
        direction,

        date,
      );

      res.json({
        data,
        meta,
      });
    } else {
      const { data, meta } = await getAll(
        orderBy,
        direction,
        date,
        idType,

        userType,
      );

      res.json({
        data,
        meta,
      });
    }
  } catch (error) {
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
        estado: true,
        detalle_orden_productos: true,
        _count: {
          select: { estado: true },
        },
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
  const { body = {}, params = {}, decoded = {} } = req;
  const { id } = params;
  const { id: userId, userType } = decoded;
  const { _count, estado } = req.result;

  let emailCliente = null;
  let emailEmpresa = null;

  if (userType === 'Cliente') {
    emailCliente = await prisma.usuario.findUnique({
      where: {
        id: userId,
      },
      select: {
        correo: true,
      },
    });

    emailEmpresa = await prisma.orden_Productos.findUnique({
      where: {
        id,
      },
      select: {
        no_orden: true,
        empresa: {
          select: {
            usuario: {
              select: {
                correo: true,
              },
            },
          },
        },
      },
    });
  }

  if (userType === 'Empresa') {
    emailEmpresa = await prisma.usuario.findUnique({
      where: {
        id: userId,
      },
      select: {
        correo: true,
      },
    });

    emailCliente = await prisma.orden_Productos.findUnique({
      where: {
        id,
      },
      select: {
        no_orden: true,
        cliente: {
          select: {
            usuario: {
              select: {
                correo: true,
              },
            },
          },
        },
      },
    });
  }

  let nuevoEstado = null;

  switch (_count.estado) {
    case 4:
      res.json({
        message:
          'No se pudo realizar el cambio de estado, la orden ya se encuentra entregada',
        status: 400,
      });
      break;
    case 3:
      if (estado[2].estado === 'Enviada') {
        nuevoEstado = 'Entregada';
        const correo = emailCliente.cliente.usuario.correo;
        const numeroOrden = emailCliente.no_orden;
        const mail = emailStructure({
          asunto: nuevoEstado,
          correo,
          numeroOrden,
        });
        await transporter.sendMail(mail);
      } else {
        res.status(400).json({
          message:
            'No se pudo realizar el cambio de estado, la orden se encuentra cancelada',
          status: 400,
        });
      }
      break;
    case 2:
      if (body.estado === 'Enviada') {
        nuevoEstado = 'Enviada';
        const correo = emailCliente.cliente.usuario.correo;
        const numeroOrden = emailCliente.no_orden;
        const mensaje = body.mensaje;
        const mail = emailStructure({
          asunto: nuevoEstado,
          correo,
          numeroOrden,
          mensaje,
        });
        await transporter.sendMail(mail);
      } else {
        nuevoEstado = 'Cancelada';
        if (userType === 'Cliente') {
          const correo = emailEmpresa.empresa.usuario.correo;
          const numeroOrden = emailEmpresa.no_orden;
          const mensaje = body.mensaje;
          const mail = emailStructure({
            asunto: nuevoEstado,
            correo,
            numeroOrden,
            mensaje,
          });
          await transporter.sendMail(mail);
        } else {
          const correo = emailCliente.cliente.usuario.correo;
          const numeroOrden = emailCliente.no_orden;
          const mensaje = body.mensaje;
          const mail = emailStructure({
            asunto: nuevoEstado,
            correo,
            numeroOrden,
            mensaje,
          });
          await transporter.sendMail(mail);
        }
      }
      break;
  }

  if (nuevoEstado === 'Cancelada') {
    updateStock(id, 'add');
  }

  if (nuevoEstado !== null) {
    try {
      const result = await prisma.estados_Orden_Productos.create({
        data: {
          id_orden_productos: id,
          estado: nuevoEstado,
        },
      });

      return res.status(200).json({
        message: 'Estado actualizado',

        data: result,
        status: 200,
      });
    } catch (error) {
      next({
        status: 400,

        message: 'No se pudo realizar el cambio de estado, verifique la orden',
      });
    }
  }
};

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
        currency_id: 'COP',
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

export const getOrdersProductsRatings = async (req, res, next) => {
  const { decoded, body = {} } = req;
  const { idType } = decoded;
  const { orderId } = body;

  try {
    const result = await prisma.detalle_Orden_Productos.findMany({
      where: {
        id_orden_productos: orderId,
      },
      include: {
        producto: {
          include: {
            valoraciones: {
              where: {
                id_cliente: idType,
              },
            },
          },
        },
      },
    });
    res.json(result).status(200);
  } catch (error) {
    next(error);
  }
};
