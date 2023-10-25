import { prisma } from "../../../database.js";

export async function create(req, res, next) {
  const { body = {}, decoded = {} } = req;
  const { conversacionId } = body;
  const { idType, userType } = decoded;
  const clienteId = userType === "Cliente" ? idType : null;
  const empresaId = userType === "Empresa" ? idType : null;

  try {
    const mensaje = await prisma.mensaje.create({
      data: {
        ...body,
        conversacionId,
        clienteId,
        empresaId,
      },
    });

    res.json({
      data: mensaje,
    });
  } catch (error) {
    next(error);
  }
}
