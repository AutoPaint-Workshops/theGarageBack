/* eslint-disable camelcase */
import { prisma } from '../../../database.js';
import { fields } from './model.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';
import { mercadopagoCreateOrder } from '../mercadopago.config.js';
import { getAll, getAllAdmin } from './utils.js';
import _ from 'lodash';

export const create = async (req, res, next) => {
  const { body = {}, decoded } = req;
  const { ordenProductos, detallesOrdenProductos } = body;
  const { idType } = decoded;
  let result;
  let reference;
  let resultEstado;
  const detallesImprmir = [];
  ordenProductos.id_cliente = idType;
  console.log('Encabezado', ordenProductos);
  try {
    await prisma.$transaction(async (transaction) => {
      // Inserta la factura
      result = await transaction.orden_Productos.create({
        data: ordenProductos,
      });
      console.log('Encabezado', result);
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
    console.error('Error en la transacción:', error);
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
        offset,
        limit,
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
        offset,
        limit,
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
    console.log('Error', error);
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
  const { body = {}, params = {} } = req;
  const { id } = params;

  const { _count, estado } = req.result;

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
      } else {
        res.json({
          message:
            'No se pudo realizar el cambio de estado, la orden se encuentra cancelada',
          status: 400,
        });
      }
      break;
    case 2:
      if (body.estado === 'Enviada') {
        nuevoEstado = 'Enviada';
      } else {
        nuevoEstado = 'Cancelada';
      }
      break;
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
