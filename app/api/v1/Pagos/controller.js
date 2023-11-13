import { prisma } from '../../../database.js';
import { fields } from './model.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';
import { paymentById } from '../mercadopago.config.js';
import { updateStock } from '../Orden_Productos/utils.js';

export const all = async (req, res, next) => {
  const { query } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });

  try {
    const [result, total] = await Promise.all([
      prisma.Pagos.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
      }),
      prisma.Pagos.count(),
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
    const result = await prisma.Pagos.findUnique({
      where: {
        id: params.id,
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
    const result = await prisma.Pagos.update({
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

export const remove = async (req, res) => {
  const { params = {} } = req;
  const { id } = params;

  try {
    await prisma.Pagos.delete({
      where: { id },
    });

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const success = async (req, res) => {
  res.json({
    message: 'webhook',
  });
};

export const receiveWebhook = async (req, res) => {
  const payment = req.query;

  if (payment.type === 'payment') {
    const data = await paymentById(payment['data.id']);
    const idOrden = data.body.external_reference;

    if (data.body.status === 'approved' && data.status === 200) {
      try {
        await updateStock(idOrden, 'substract');
        const result = await prisma.Pagos.update({
          where: {
            id_orden_productos: idOrden,
          },
          data: {
            estado: 'Aprobado',
            id_pago_mp: data.body.id.toString(),
            metodo_pago: data.body.payment_method.type,
          },
        });
        await prisma.estados_Orden_Productos.create({
          data: {
            id_orden_productos: idOrden,
            estado: 'Pagada',
          },
        });
      } catch (error) {
        console.log(error);
      }
    } else if (data.body.status === 'rejected') {
      await prisma.Pagos.update({
        where: {
          id_orden_productos: idOrden,
        },
        data: {
          estado: 'Rechazada',
        },
      });
      await prisma.estados_Orden_Productos.create({
        data: {
          id_orden_productos: idOrden,
          estado: 'Rechazada',
        },
      });
    }

    // console.log(data);
    res.status(200).send();
  }

  res.status(200).send();
};
