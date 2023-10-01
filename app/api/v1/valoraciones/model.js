import { z } from "zod";
import escape from "validator/lib/escape.js";

export const ValoracionSchema = z
  .object({
    calificacion: z.number(),
    comentarios: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
  })
  .strict();

export const fields = [
  ...Object.keys(ValoracionSchema.shape),
  "id",
  "fecha_creacion",
];
