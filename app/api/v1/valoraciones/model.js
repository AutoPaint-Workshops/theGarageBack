import { z } from "zod";
import escape from "validator/lib/escape.js";

export const ValoracionSchema = z.object({
  calificacion: z
    // Validation
    .number(),
  comentarios: z
    // Validation
    .string()
    .trim()
    .min(3)
    .max(256)
    .toLowerCase()

    .transform(function (value) {
      return escape(value);
    }),
});

export const fields = [
  ...Object.keys(ValoracionSchema.shape),
  "id",
  "fecha_creacion",
];
