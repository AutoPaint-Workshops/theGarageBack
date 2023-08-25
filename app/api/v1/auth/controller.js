import { prisma } from '../../../database.js';
import { encryptPassword, verifyPassword } from './model.js';
// import { fields } from './model.js';
// import { parseOrderParams, parsePaginationParams } from '../../../utils.js';

export const tipo = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const tipo = params.tipo;
    if (tipo !== 'cliente' && tipo !== 'empresa') {
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
    const { userData, fullData } = body;
    const userResult = await prisma.usuario.create({
      data: {
        ...userData,
        contrasena: password,
      },
      select: {
        id: true,
        correo: true,
        tipo_usuario: true,
        estatus: true,
      },
    });
    const userID = userResult.id;
    const fullResult =
      tipo === 'cliente'
        ? await prisma.cliente.create({
            data: {
              id_usuario: userID,
              ...fullData,
            },
          })
        : await prisma.empresa.create({
            data: {
              id_usuario: userID,
              ...fullData,
            },
          });
    res.status(201);
    res.json({
      data: {
        userResult,
        fullResult,
      },
      message: 'Usuario creado satisfactoriamente',
    });
  } catch (error) {
    next(error);
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
    });

    if (user === null) {
      return next({
        message: 'Invalid email or password',
        status: 401,
      });
    }

    const confirmPassword = await verifyPassword(contrasena, user.contrasena);

    if (!confirmPassword) {
      return next({
        message: 'Invalid email or password',
        status: 401,
      });
    }

    res.json({
      data: {
        ...user,
        id: undefined,
        contrasena: undefined,
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
        message: 'Invalid email',
        status: 401,
      });
    }
    res.json({
      message: 'Ok',
      status: 401,
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
