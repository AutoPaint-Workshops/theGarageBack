import { z } from 'zod';

const ConsultaSchema = z.object({
  correo: z.string().email(),
  mensaje: z.string().max(500),
  nombre: z.string().max(100),
});

const RespuestaSchema = z.object({
  respuesta: z.string().max(500),
});

export const validateConsulta = async (data) => {
  return ConsultaSchema.safeParseAsync(data);
};

export const validateRespuesta = async (data) => {
  return RespuestaSchema.safeParseAsync(data);
};

export const consultaFields = [...Object.keys(ConsultaSchema.shape)];
export const respuestaFields = [...Object.keys(RespuestaSchema.shape)];
