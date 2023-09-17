import { z } from "zod";
import escape from "validator/lib/escape.js";

export const ProductosSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
    nombre_categoria: z.string(),
    descripcion: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
    ficha_tecnica: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
    precio: z.number(),
    cantidad_disponible: z.number(),
    estatus: z.boolean(),
    tipo_entrega: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
    marca: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .transform(function (value) {
        return escape(value);
      }),
    impuestos: z.number(),
  })
  .strict();

export const fields = [
  ...Object.keys(ProductosSchema.shape),
  "id",
  "fecha_creacion",
  "fecha_actualizacion",
];

// export const fields = [
//   "id",
//   "nombre",
//   "descripcion",
//   "ficha_tecnica",
//   "precio",
//   "cantidad_disponible",
//   "estatus",
//   "tipo_entrega",
//   "marca",
//   "impuestos",
//   "fecha_creacion",
//   "fecha_actualizacion",
// ];
