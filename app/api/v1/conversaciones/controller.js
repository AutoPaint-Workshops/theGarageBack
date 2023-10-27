import { prisma } from "../../../database.js";

export async function create(req, res, next) {
  const { body = {}, decoded = {} } = req;
  const { recipientId, orden_ProductosId } = body;
  const { userType, idType } = decoded;

  const clienteId = userType === "Cliente" ? idType : recipientId;
  const empresaId = userType === "Cliente" ? recipientId : idType;

  try {
    const conversacion = await prisma.conversacion.create({
      data: {
        clienteId,
        empresaId,
        orden_ProductosId,
      },
    });

    res.json({
      data: conversacion,
    });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  const { body = {}, decoded = {} } = req;
  const { recipientId } = body;
  const { idType } = decoded;

  try {
    const conversacion = await prisma.conversacion.findMany({
      where: {
        OR: [
          {
            clienteId: idType,
          },
          {
            empresaId: idType,
          },
        ],
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre_completo: true,
            usuario: {
              select: {
                url_foto: true,
              },
            },
          },
        },

        empresa: {
          select: {
            id: true,
            razon_social: true,
            usuario: {
              select: {
                url_foto: true,
              },
            },
          },
        },
      },
    });

    res.json({
      data: conversacion,
    });
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  const { decoded = {}, params = {} } = req;
  const { id: conversationId } = params;
  const { idType } = decoded;

  try {
    const conversacion = await prisma.conversacion.findFirst({
      where: {
        AND: [
          {
            id: conversationId,
          },
          {
            OR: [
              {
                clienteId: idType,
              },
              {
                empresaId: idType,
              },
            ],
          },
        ],
      },

      include: {
        cliente: {
          select: {
            nombre_completo: true,

            usuario: {
              select: {
                url_foto: true,
                correo: true,
              },
            },
          },
        },
        empresa: {
          select: {
            razon_social: true,
            usuario: {
              select: {
                url_foto: true,
                correo: true,
              },
            },
          },
        },
        mensajes: {
          orderBy: {
            fecha_creacion: "asc",
          },
        },

        orden_productos: {
          select: {
            no_orden: true,
          },
        },
      },
    });

    res.json({
      data: conversacion,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  const { body = {}, params = {} } = req;
  const { id: conversationId } = params;

  try {
    const conversacion = await prisma.conversacion.update({
      where: {
        id: conversationId,
      },
      data: {
        ...body,
      },
    });

    res.json({
      data: conversacion,
    });
  } catch (error) {
    next(error);
  }
}
