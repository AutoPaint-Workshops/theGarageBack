import { prisma } from "../../../database.js";
import { signToken, verifyToken } from "../auth.js";
import { transporter } from "../mailer.js";
import {
  validateCreate,
  validatePasswordRecovery,
  validatePasswordUpdate,
  validateSignIn,
} from "./model.js";
import {
  ifType,
  isActive,
  urlFoto,
  encryptPassword,
  verifyPassword,
  urlDocument,
} from "./utils.js";

export const tipo = async (req, res, next) => {
  const { params = {} } = req;
  try {
    if (ifType(params.tipo)) {
      next({
        message: "Tipo de usuario inválido",
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

export const authEmail = async (req, res, next) => {
  const { params = {} } = req;
  const { token } = params;
  const decoded = verifyToken(token);

  if (!decoded) {
    return next({
      message: "Prohibido",
      status: 400,
    });
  }

  const { correo, tipoUsuario } = decoded;

  const estatus = isActive(tipoUsuario);

  try {
    await prisma.usuario.update({
      where: {
        correo,
      },
      data: {
        estatus,
        fecha_actualizacion: new Date().toISOString(),
      },
    });

    res.status(201);
    res.json({
      message: "Autenticacion correcta",
    });
  } catch (error) {
    next({
      message: "No se pudo autenticar la cuenta",
      status: 400,
    });
  }
};

export const resendEmail = async (req, res, next) => {
  const { body } = req;
  const { correo } = body;

  try {
    const user = await prisma.usuario.findUnique({
      where: {
        correo,
        estatus: "Confirmacion",
      },
    });

    if (!user) {
      return next({
        message: "El email no se encuentra registrado",
        status: 400,
      });
    }

    const { tipo_usuario: tipoUsuario } = user;
    const token = signToken({ correo, tipoUsuario });

    await transporter.sendMail({
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: "Reenvío de codigo de autenticación",
      text: "Tu usuario se ha creado satisfactoriamente",
      html: `<p>Para confirmar tu correo porfavor ingresa al siguiente enlace ${process.env.API_URL}/v1/auth/confirmacion/${token} </p>`,
    });

    res.status(200);
    res.json({
      message: "Se ha enviado el mensaje de autenticación a tu correo",
    });
  } catch (error) {
    return next({ error });
  }
};

export const signup = async (req, res, next) => {
  const { body = {}, tipo } = req;
  const { data: bodyData } = body;

  const photoReq = req.files
    ? req.files.filter((file) => file.mimetype === "image/jpeg")
    : [];
  const pdfReq = req.files
    ? req.files.filter((file) => file.mimetype === "application/pdf")
    : [];

  const signUpBody = JSON.parse(bodyData);

  const { success, data, error } = await validateCreate(signUpBody, tipo);
  if (!success) {
    return next({
      message:
        "Los datos ingresados en el formulario no son correctos, vuelva a intentarlo",
      status: 400,
      error,
    });
  }

  const { userData, userTypeData } = data;
  const password = await encryptPassword(data.userData.contrasena);
  const foto = await urlFoto(photoReq);
  const camaraComercio = await urlDocument(pdfReq);

  try {
    await prisma.$transaction(async (transaction) => {
      const userResult = await transaction.usuario.create({
        data: {
          ...userData,
          url_foto: foto,
          estatus: "Confirmacion",
          contrasena: password,
        },
      });

      const { correo, id: userID, tipo_usuario: tipoUsuario } = userResult;
      const token = signToken({ correo, tipoUsuario });

      await transporter.sendMail({
        from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
        to: correo,
        subject: "Codigo de autenticación",
        text: "Tu usuario se ha creado satisfactoriamente",
        html: `<p>Para confirmar tu correo porfavor ingresa al siguiente enlace ${process.env.WEB_URL}/activacion/${token} </p>`,
      });

      if (tipo === "cliente") {
        await transaction.cliente.create({
          data: {
            id_usuario: userID,
            ...userTypeData,
          },
        });
      }

      if (tipo === "empresa") {
        const prueba = await transaction.empresa.create({
          data: {
            id_usuario: userID,
            ...userTypeData,
            camara_comercio: camaraComercio,
          },
        });
      }

      const message =
        tipo !== "empresa"
          ? "Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta"
          : "Usuario creado satisfactoriamente, espera a que un administrador confirme tu cuenta";

      res.status(201).json({ message });
    });
  } catch (error) {
    next({
      message:
        "No se pudo crear el usuario, el correo, documento o nit ya se encuentra registrado en el sistema",
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

    if (!user) {
      return next({
        message: "Correo o contraseña invalidos",
        status: 403,
      });
    }

    const confirmPassword = await verifyPassword(contrasena, user.contrasena);

    if (!confirmPassword) {
      return next({
        message: "Correo o contraseña invalidos",
        status: 403,
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
      : { id: "Admin" };

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
          "Si su correo se encuentra registrado, recibira un correo con un enlace para continuar",
        status: 200,
      });
    }

    const { tipo_usuario: tipoUsuario } = user;
    const token = signToken({ correo, tipoUsuario });

    await transporter.sendMail({
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: "Recuperación de contraseña",
      text: "Recuperación de contraseña",
      html: `<p>Para recuperar tu contraseña porfavor ingresa al siguiente enlace ${process.env.WEB_URL}/Recoverypassword/${token} </p>`,
    });

    res.json({
      message:
        "Si su correo se encuentra registrado, recibira un correo con un enlace para continuar",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  const { body = {}, params = {} } = req;
  const { token } = params;
  const decoded = verifyToken(token);
  const { correo } = decoded;

  if (!decoded) {
    return next({
      message: "Prohibido",
      status: 403,
    });
  }

  try {
    const { success, data, error } = await validatePasswordUpdate(body);

    if (!success)
      return next({
        error,
      });

    try {
      const password = await encryptPassword(data.contrasena);
      await prisma.usuario.update({
        where: {
          correo,
        },
        data: {
          contrasena: password,
          fecha_actualizacion: new Date().toISOString(),
        },
      });
      res.json({
        message: "Confraseña actualizada correctamente",
        status: 200,
      });
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const testActivationLink = async (req, res, next) => {
  const { body } = req;
  const { correo } = body;

  try {
    const user = await prisma.usuario.findUnique({
      where: {
        correo,
        estatus: "Confirmacion",
      },
    });

    if (!user) {
      return next({
        message: "El email no se encuentra registrado",
        status: 400,
      });
    }

    const { tipo_usuario: tipoUsuario } = user;
    const token = signToken({ correo, tipoUsuario });

    res.status(200);
    res.json({
      activation_url: `${process.env.WEB_URL}/activacion/${token}`,
    });
  } catch (error) {
    return next({ error });
  }
};
