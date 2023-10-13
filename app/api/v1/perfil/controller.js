import { prisma } from '../../../database.js';
import { fields } from './model.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';
import { encryptPassword, urlFoto, verifyPassword } from '../auth/utils.js';

export const id = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const { id } = params;
    const result = await prisma.usuario.findUnique({
      where: {
        id,
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
  const { data } = body;
  const updateBody = JSON.parse(data);
  const { id, idType, userType } = decoded;

  try {
    const { userData = null, userTypeData = null } = updateBody;

    if (!userData && !userTypeData)
      return next({ message: 'Nada que actualizar', status: 400 });

    if (userData) {
      if (req.files.length > 0) {
        const foto = await urlFoto(req.files);
        userData.url_foto = foto;
      }

      const result = await prisma.usuario.update({
        where: {
          id,
        },
        data: {
          ...userData,
          fecha_actualizacion: new Date().toISOString(),
        },
        select: {
          ciudad: true,
          departamento: true,
          direccion: true,
          fecha_actualizacion: true,
          fecha_creacion: true,
          correo: true,
          tipo_usuario: true,
          url_foto: true,
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
        select: {
          nombre_completo: true,
          numero_documento: true,
          telefono: true,
          tipo_documento: true,
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

export const userById = async (req, res, next) => {
  const { result } = req;
  try {
    const user = await prisma.usuario.findUnique({
      where: {
        id: result.id,
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

export const all = async (req, res, next) => {
  const { query, decoded } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });
  const { userType } = decoded;

  if (userType !== 'Administrador')
    return next({ message: 'Prohibido', status: 403 });

  try {
    const [result, total] = await Promise.all([
      prisma.usuario.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        select: {
          id: true,
          correo: true,
          tipo_usuario: true,
          estatus: true,
          url_foto: true,
          cliente: {
            select: {
              nombre_completo: true,
              numero_documento: true,
            },
          },
          empresa: {
            select: {
              razon_social: true,
              numero_documento_empresa: true,
            },
          },
        },
      }),
      prisma.usuario.count(),
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

export const allByType = async (req, res, next) => {
  const { query, decoded, params } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });
  const { userType } = decoded;
  const { tipo } = params;

  if (userType !== 'Administrador')
    return next({ message: 'Prohibido', status: 403 });

  try {
    const [result, total] = await Promise.all([
      prisma.usuario.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        where: { tipo_usuario: tipo },
        select: {
          id: true,
          correo: true,
          tipo_usuario: true,
          estatus: true,
          url_foto: true,
          cliente: {
            select: {
              nombre_completo: true,
              numero_documento: true,
            },
          },
          empresa: {
            select: {
              razon_social: true,
              numero_documento_empresa: true,
            },
          },
        },
      }),
      tipo === 'Cliente'
        ? prisma.cliente.count()
        : tipo === 'Empresa'
        ? prisma.empresa.count()
        : prisma.usuario.count({
            where: {
              tipo_usuario: 'Administrador',
            },
          }),
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

export const allCompanys = async (req, res, next) => {
  const { query, decoded, params } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    fields,
    ...query,
  });
  const { tipo } = params;

  try {
    const [result, total] = await Promise.all([
      prisma.usuario.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          [orderBy]: direction,
        },
        where: { tipo_usuario: 'Empresa' },
        select: {
          url_foto: true,
          fecha_creacion: true,

          empresa: {
            select: {
              razon_social: true,
            },
          },
        },
      }),

      prisma.empresa.count(),
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

export const updateById = async (req, res, next) => {
  const { body = {}, decoded = {}, result = {} } = req;
  const { userType } = decoded;
  const { id } = result;

  if (userType !== 'Administrador')
    return next({ message: 'Prohibido', status: 403 });

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

    if (result.tipo_usuario === 'Cliente' && userTypeData) {
      const result = await prisma.cliente.update({
        where: {
          id_usuario: id,
        },
        data: {
          ...userTypeData,
        },
      });
      req.typeData = result;
    }

    if (result.tipo_usuario === 'Empresa' && userTypeData) {
      const result = await prisma.empresa.update({
        where: {
          id_usuario: id,
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

export const changePassword = async (req, res, next) => {
  const { body = {}, decoded = {} } = req;
  const { id } = decoded;
  const { password, newPassword } = body;

  try {
    const user = await prisma.usuario.findUnique({
      where: {
        id,
      },
    });

    const confirmPassword = await verifyPassword(password, user.contrasena);

    if (!confirmPassword)
      return next({ message: 'Contraseña incorrecta', status: 400 });

    const nuevaContrasena = await encryptPassword(newPassword);

    const result = await prisma.usuario.update({
      where: {
        id,
      },
      data: {
        contrasena: nuevaContrasena,
        fecha_actualizacion: new Date().toISOString(),
      },
    });
    req.user = result;

    res
      .json({
        message: 'Contraseña actualizada',
      })
      .status(200);
  } catch (error) {
    next(error);
  }
};
