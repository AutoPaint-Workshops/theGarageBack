import { faker } from "@faker-js/faker";
import FormData from "form-data";

export const getProduct = (overrides = {}) => {
  const formData = new FormData();
  const binaryData = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  ]);

  formData.append("nombre_categoria", "Pinturas");
  formData.append("nombre", "algo");
  formData.append("descripcion", "algo");
  formData.append("ficha_tecnica", "algo");
  formData.append("impuestos", 1);
  formData.append("precio", 1);
  formData.append("cantidad_disponible", 1);
  formData.append("images", binaryData, { filename: "imagen_simulada.png" });
  formData.append("tipo_entrega", "Envío");
  formData.append("marca", "Mazda");
  formData.append("estatus", "true");

  return formData;
};
