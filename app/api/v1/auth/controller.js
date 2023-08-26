import { prisma } from '../../../database.js';
import { signToken } from '../auth.js';
import { encryptPassword, verifyPassword } from './model.js';
// import { fields } from './model.js';
// import { parseOrderParams, parsePaginationParams } from '../../../utils.js';

export const tipo = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const tipo = params.tipo;
    if (tipo !== 'cliente' && tipo !== 'empresa' && tipo !== 'administrador') {
      next({
        message: 'Tipo de usuario inválido',
        status: 404,
      });
    } else {
      req.tipo = tipo;
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  const { body = {}, tipo } = req;
  try {
    const password = await encryptPassword(body.userData.contrasena);
    const { userData, userTypeData } = body;
    const userResult = await prisma.usuario.create({
      data: {
        ...userData,
        contrasena: password,
      },
    });
    const userID = userResult.id;
    if (tipo === 'cliente') {
      await prisma.cliente.create({
        data: {
          id_usuario: userID,
          ...userTypeData,
        },
      });
      res.json({
        message: 'Usuario creado satisfactoriamente',
      });
    }
    if (tipo === 'empresa') {
      await prisma.empresa.create({
        data: {
          id_usuario: userID,
          ...userTypeData,
        },
      });
      res.json({
        message:
          'Solicitud de creación recibida, le llegará un correo en menos de 24 horas con la respuesta',
      });
    }
    if (tipo === 'administrador') {
      res.json({
        message: 'Usuario creado satisfactoriamente',
      });
    }
    res.status(201);
  } catch (error) {
    next({
      message: 'No se pudo crear el usuario, intentelo mas tarde',
      status: 400,
      error,
    });
  }
};

export const signin = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const { correo, contrasena } = body;
    const user = await prisma.usuario.findUnique({
      where: {
        correo,
      },
      include: {
        cliente: true,
        empresa: true,
      },
    });

    if (user === null) {
      return next({
        message: 'Correo o contraseña invalidos',
        status: 401,
      });
    }

    const confirmPassword = await verifyPassword(contrasena, user.contrasena);

    if (!confirmPassword) {
      return next({
        message: 'Correo o contraseña invalidos',
        status: 401,
      });
    }

    if (user.tipo_usuario === 'Administrador') {
      const { id, tipo_usuario: userType } = user;
      const token = signToken({ id, userType });
      res.json({
        data: {
          ...user,
          id: undefined,
          contrasena: undefined,
        },
        meta: {
          token,
        },
      });
      return next(res);
    }

    const typeData = !!user.cliente
      ? await prisma.cliente.findUnique({
          where: {
            id_usuario: user.id,
          },
        })
      : await prisma.empresa.findUnique({
          where: {
            id_usuario: user.id,
          },
        });

    const { id, tipo_usuario: userType } = user;
    const { idType } = typeData;

    const token = signToken({ id, userType, idType });

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
      meta: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const passwordRecovery = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const { correo } = body;
    const user = await prisma.usuario.findUnique({
      where: {
        correo,
      },
      select: {
        id: true,
        correo: true,
        contrasena: true,
        estatus: true,
      },
    });

    if (user === null) {
      return next({
        message:
          'Si su correo se encuentra registrado, recibira un correo con un enlace para continuar',
        status: 200,
      });
    }
    res.json({
      message:
        'Si su correo se encuentra registrado, recibira un correo con un enlace para continuar',
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  const { body = {} } = req;
  try {
    const { correo, contrasena, codigo } = body;

    if (!codigo) {
      return next({
        message: 'Código invalido',
        status: 401,
      });
    }

    const user = await prisma.usuario.update({
      where: {
        correo,
      },
      data: {
        contrasena,
        fecha_actualizacion: new Date().toISOString(),
      },
    });
    res.json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
