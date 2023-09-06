import { z } from "zod";
import escape from "validator/lib/escape.js";

export const ServiciosSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
    id_categoria: z.string(),
    descripcion: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
    precio: z.number(),
    estado: z.boolean(),
    tipo_entrega: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),

    impuestos: z.number(),
    horario_atencion: z.string(),
  })
  .strict();

export const fields = [
  ...Object.keys(ServiciosSchema.shape),
  "id",
  "fecha_creacion",
  "fecha_actualizacion",
];
