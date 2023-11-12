import { prisma } from '../../../database.js';
import { parseOrderParams, parsePaginationParams } from '../../../utils.js';
import { emailStructure, transporter } from '../mailer.js';
import {
  validateConsulta,
  validateRespuesta,
  consultaFields,
} from './model.js';

export const createRequest = async (req, res, next) => {
  const { body } = req;
  const { success, data, error } = await validateConsulta(body);
  if (!success) {
    return next({
      message:
        'Los datos ingresados en el formulario no son correctos, vuelva a intentarlo',
      status: 400,
      error,
    });
  }

  const { nombre, correo, mensaje } = data;
  try {
    await prisma.consultas.create({
      data: {
        nombre_contacto: nombre,
        correo_contacto: correo,
        consulta: mensaje,
        estado_consulta: 'pendiente',
      },
    });
    res.status(201).json({ mensaje: 'Consulta creada' });
  } catch (error) {
    next({ status: 400, message: 'Error al crear la consulta' });
  }
};

export const getAllRequests = async (req, res, next) => {
  const { query } = req;
  const { offset, limit } = parsePaginationParams(query);
  const { orderBy, direction } = parseOrderParams({
    consultaFields,
    ...query,
  });

  const { decoded } = req;
  const { userType } = decoded;

  if (userType !== 'Administrador') {
    next({ status: 401, message: 'No autorizado' });
  }

  try {
    const requests = await prisma.consultas.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        fecha_consulta: direction,
      },
    });
    res.status(200).json(requests);
  } catch (error) {
    return next({ status: 404, message: 'No se encontraron consultas' });
  }
};

export const idRequest = async (req, res, next) => {
  const { params = {} } = req;
  try {
    const { id } = params;
    const result = await prisma.consultas.findUnique({
      where: {
        id,
      },
    });

    if (result) {
      req.result = result;
    } else {
      next({ message: 'Consulta invalida', status: 400 });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  const { decoded } = req;
  const { userType } = decoded;
  const { result } = req;

  if (userType !== 'Administrador') {
    next({ status: 401, message: 'No autorizado' });
  }
  res.status(200).json(result);
};

export const updateById = async (req, res, next) => {
  const { decoded, body } = req;
  const { userType } = decoded;
  const { result } = req;
  const { correo_contacto: correo, estado_consulta } = result;

  if (userType !== 'Administrador') {
    next({ status: 401, message: 'No autorizado' });
  }

  if (estado_consulta === 'resuelto') {
    return next({ status: 400, message: 'La consulta ya fue resuelta' });
  }

  const { success, data, error } = await validateRespuesta(body);
  if (!success) {
    return next({
      message:
        'Los datos ingresados en el formulario no son correctos, vuelva a intentarlo',
      status: 400,
      error,
    });
  }

  const { respuesta } = data;
  try {
    const actualizacion = await prisma.consultas.update({
      where: {
        id: result.id,
      },
      data: {
        estado_consulta: 'resuelto',
        respuesta,
      },
    });

    const mail = emailStructure({ asunto: 'solucion', correo, respuesta });
    await transporter.sendMail(mail);

    res.status(200).json(actualizacion);
  } catch (error) {
    return next({ status: 400, message: 'Error al actualizar la consulta' });
  }
};
