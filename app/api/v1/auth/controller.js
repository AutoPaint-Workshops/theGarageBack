import { prisma } from '../../../database.js';
import { signToken, verifyToken } from '../auth.js';
import { transporter } from '../mailer.js';
import {
  validateCreate,
  validatePasswordRecovery,
  validatePasswordUpdate,
  validateSignIn,
} from './model.js';
import {
  ifType,
  isActive,
  urlFoto,
  encryptPassword,
  verifyPassword,
} from './utils.js';

export const tipo = async (req, res, next) => {
  const { params = {} } = req;
  try {
    if (ifType(params.tipo)) {
      next({
        message: 'Tipo de usuario inválido',
        status: 404,
      });
    } else {
      req.tipo = params.tipo;
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const authEmail = (req, res, next) => {
  const { params = {} } = req;
  const { token } = params;
  const result = verifyToken(token);

  if (!result) {
    return next({
      message: 'Prohibido',
      status: 400,
    });
  }

  // TODO: CAMBIAR EL ESTATUS A ACTIVO DE CLIENTES Y A VERIFICANDO EMPRESAS

  res.status(201);
  res.json({
    message: 'Autenticacion correcta',
  });
};

export const signup = async (req, res, next) => {
  const { body = {}, tipo } = req;
  try {
    const { success, data, error } = await validateCreate(body, tipo);
    if (!success) {
      return next({
        error,
      });
    }

    const { userData, userTypeData } = data;

    const password = await encryptPassword(data.userData.contrasena);
    const foto = urlFoto(userData);
    // const estatus = isActive(tipo);

    const userResult = await prisma.usuario.create({
      data: {
        ...userData,
        url_foto: foto,
        estatus: 'Confirmacion',
        contrasena: password,
      },
    });

    const { correo, id: userID } = userResult;
    const token = signToken({ correo });

    await transporter.sendMail({
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: 'Codigo de inicio de sesión',
      text: 'Tu usuario se ha creado satisfactoriamente',
      html: `<p>Para confirmar tu correo porfavot ingresa al siguiente enlace ${process.env.API_URL}/confirmacion/${token} </p>`,
    });

    if (tipo === 'cliente') {
      await prisma.cliente.create({
        data: {
          id_usuario: userID,
          ...userTypeData,
        },
      });
      res.json({
        message:
          'Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta',
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
          'Solicitud de creación recibida, revisa tu correo para confirmar tu cuenta',
      });
    }

    if (tipo === 'administrador') {
      res.json({
        message:
          'Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta',
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
    const { success, data, error } = await validateSignIn(body, tipo);
    if (!success)
      return next({
        error,
      });

    const { correo, contrasena } = data;

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

    const typeData = !!user.cliente
      ? await prisma.cliente.findUnique({
          where: {
            id_usuario: user.id,
          },
        })
      : !!user.empresa
      ? await prisma.empresa.findUnique({
          where: {
            id_usuario: user.id,
          },
        })
      : { id: 'Admin' };

    const { id, tipo_usuario: userType } = user;
    const { id: idType } = typeData;

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
    const { success, data, error } = await validatePasswordRecovery(body);
    if (!success)
      return next({
        error,
      });

    const { correo } = data;
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
    const { success, data, error } = await validatePasswordUpdate(body);
    if (!success)
      return next({
        error,
      });

    const { correo, contrasena, codigo } = data;

    // // Espacio para la verificacion del código
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
