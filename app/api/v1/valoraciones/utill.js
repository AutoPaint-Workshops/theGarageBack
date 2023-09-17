import { prisma } from "../../../database.js";

// Verifica si el producto o servicio existe en la tabla de detalle_orden_productos
export const verificarProductoOservicioEnDetalleOrden = async (
  req,
  res,
  next
) => {
  const { decoded = {}, params } = req;
  const { idType: id_cliente } = decoded;
  const { productId: id_producto } = params;

  try {
    const isProductInOrder = await prisma.detalle_orden_productos.findFirst({
      where: {
        id_orden_productos: {
          cliente: {
            id: id_cliente,
          },
        },
        id_producto: id_producto,
      },
    });

    const isServiceInOrder = await prisma.detalle_orden_servicios.findFirst({
      where: {
        id_orden_servicios: {
          cliente: {
            id: id_cliente,
          },
        },
        id_servicio: id_servicio,
      },
    });

    if (!isProductInOrder && !isServiceInOrder) {
      return res.status(404).json({
        error: "No esta autorizado para realizar esta accion",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
