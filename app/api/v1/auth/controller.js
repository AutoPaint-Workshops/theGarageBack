import { prisma } from '../../../database.js';
// import { fields } from './model.js';
// import { parseOrderParams, parsePaginationParams } from '../../../utils.js';

export const signupClient = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const { userData, clientData } = body;
    const userResult = await prisma.usuario.create({
      data: {
        ...userData,
      },
    });
    const userID = userResult.id;
    const clientResult = await prisma.cliente.create({
      data: {
        id_usuario: userID,
        ...clientData,
      },
    });
    res.status(201);
    res.json({
      data: {
        userResult,
        clientResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signupCompany = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const { userData, companyData } = body;
    const userResult = await prisma.usuario.create({
      data: {
        ...userData,
      },
    });
    const userID = userResult.id;
    const companyResult = await prisma.empresa.create({
      data: {
        id_usuario: userID,
        ...companyData,
      },
    });
    res.status(201);
    res.json({
      data: {
        userResult,
        companyResult,
      },
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
      select: {
        id: true,
        correo: true,
        contrasena: true,
        estatus: true,
      },
    });

    if (user === null || user.contrasena !== contrasena) {
      return next({
        message: 'Invalid email or password',
        status: 401,
      });
    }
    res.json({
      data: {
        ...user,
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
