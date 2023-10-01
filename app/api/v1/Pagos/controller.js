import { prisma } from "../../../database.js";
import { fields } from "./model.js";
import { parseOrderParams, parsePaginationParams } from "../../../utils.js";
import { paymentById } from "../mercadopago.config.js";
/*
export const create = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const result = await prisma.Pagos.create({
      data: body,
    });

    res.status(201);
    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};*/

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
  console.log(req);
  res.json({
    message: "webhook",
  });
};

export const receiveWebhook = async (req, res) => {
  const payment = req.query;

  if (payment.type === "payment") {
    const data = await paymentById(payment["data.id"]);
    const idOrden = data.body.external_reference;

    if (data.body.status === "approved" && data.status === 200) {
      try {
        await descargarProductos(idOrden);
        const result = await prisma.Pagos.update({
          where: {
            id_orden_productos: idOrden,
          },
          data: {
            estado: "approved",
            id_pago_mp: data.body.id.toString(),
            metodo_pago: data.body.payment_method.type,
          },
        });
      } catch (error) {
        console.log(error);
      }
    } else if (data.body.status === "rejected") {
      await prisma.Pagos.update({
        where: {
          id_orden_productos: idOrden,
        },
        data: {
          estado: "rejected",
        },
      });
    }

    // console.log(data);
    res.status(200);
  }

  res.status(200);
};

const descargarProductos = async (idOrden) => {
  let resultCant = 0;
  let resultado = 0;
  try {
    const estadoPago = await prisma.pagos.findUnique({
      where: {
        id_orden_productos: idOrden,
      },
      select: {
        estado: true,
      },
    });
    if (estadoPago.estado === "creado") {
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
        const res = resultCant.cantidad_disponible - detalle.cantidad;
        console.log("la pinche resta", res);
        resultado = await prisma.Producto.update({
          where: {
            id: detalle.id_producto,
          },
          data: {
            cantidad_disponible: res,
          },
        });
      });
    }
  } catch (error) {
    console.error("Error en la transacción:", error);
    return error;
  }
};
