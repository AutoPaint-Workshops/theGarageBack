import { prisma } from '../../../database.js';
import { fields } from './model.js';

export const id = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const { id } = params;
    const result = await prisma.empresa.findUnique({
      where: {
        numero_documento_empresa: id,
      },
    });

    if (result) {
      req.result = result;
    } else {
      next({ message: 'Usuario invalido', status: 400 });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const read = async (req, res, next) => {
  const { decoded } = req;
  try {
    const { id, idType, userType } = decoded;
    const user = await prisma.usuario.findUnique({
      where: {
        id,
      },
      include: {
        cliente: true,
        empresa: true,
      },
    });

    if (user === null) {
      return next({
        message: 'Usuario no encontrado',
        status: 401,
      });
    }

    const typeData =
      userType === 'Cliente'
        ? await prisma.cliente.findUnique({
            where: {
              id: idType,
            },
          })
        : userType === 'Empresa'
        ? await prisma.empresa.findUnique({
            where: {
              id: idType,
            },
          })
        : { id: 'Admin' };

    res.json({
      data: {
        user: {
          ...user,
          id: undefined,
          contrasena: undefined,
          cliente: undefined,
          empresa: undefined,
        },
        typeData: {
          ...typeData,
          id: undefined,
          id_usuario: undefined,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  const { body = {}, decoded = {} } = req;
  const { id, idType, userType } = decoded;

  try {
    const { userData = null, userTypeData = null } = body;

    if (!userData && !userTypeData)
      return next({ message: 'Nada que actualizar', status: 400 });

    if (userData) {
      const result = await prisma.usuario.update({
        where: {
          id,
        },
        data: {
          ...userData,
          fecha_actualizacion: new Date().toISOString(),
        },
      });
      req.user = result;
    }

    if (userType === 'Cliente' && userTypeData) {
      const result = await prisma.cliente.update({
        where: {
          id: idType,
        },
        data: {
          ...userTypeData,
        },
      });
      req.typeData = result;
    }

    if (userType === 'Empresa' && userTypeData) {
      const result = await prisma.empresa.update({
        where: {
          id: idType,
        },
        data: {
          ...userTypeData,
        },
      });
      req.typeData = result;
    }
    res.json({
      user: { ...req.user },
      typeData: { ...req.typeData },
    });
  } catch (error) {
    next(error);
  }
};

export const readById = async (req, res, next) => {
  const { result } = req;
  try {
    const user = await prisma.usuario.findUnique({
      where: {
        id: result.id_usuario,
      },
      include: {
        cliente: true,
        empresa: true,
      },
    });

    res.json({
      data: {
        user: {
          ...user,
          id: undefined,
          contrasena: undefined,
          cliente: undefined,
          empresa: undefined,
        },
        typeData: {
          ...result,
          id: undefined,
          id_usuario: undefined,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
