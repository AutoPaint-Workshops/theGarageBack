import { faker } from "@faker-js/faker";
import FormData from "form-data";

export const getProduct = (overrides = {}) => {
  const formData = new FormData();
  const binaryData = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  ]);

  formData.append("nombre_categoria", "Pinturas");
  formData.append("nombre", "ProductTest");
  formData.append("descripcion", "DescriptionTest");
  formData.append("ficha_tecnica", "test");
  formData.append("impuestos", 1);
  formData.append("precio", 1);
  formData.append("cantidad_disponible", 1);
  formData.append("images", "");
  formData.append("tipo_entrega", "Envío");
  formData.append("marca", "Test");
  formData.append("estatus", "true");

  return formData;
};
export const getPartialProduct = (overrides = {}) => {
  const formData = new FormData();
  const binaryData = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  ]);

  formData.append("nombre", "ProductoAtualizado");

  return formData;
};

export const getIncorrectDataProduct = (overrides = {}) => {
  const formData = new FormData();

  formData.append("nombre_categoria", "Pinturas");
  formData.append("nombre", "ProductTest");
  formData.append("descripcion", "DescriptionTest");
  formData.append("ficha_tecnica", "test");
  formData.append("impuestos", 1);
  formData.append("precio", "true");
  formData.append("cantidad_disponible", 1);

  return formData;
};
