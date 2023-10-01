import request from "supertest";

import { app } from "../index.js";
import { describe, test } from "vitest";
import { resetDb } from "./helpers/reset-db.js";
import FormData from "form-data";

describe("GET /api/v1/productos", () => {
  test("should return 200", async () => {
    console.log("Borrando base de datos de prueba");
    beforeEach(async () => {
      await resetDb();
    });

    const response = await request(app).get("/api/v1/productos");
    expect(response.status).toBe(200);
  });

  test("signup should return 201", async () => {
    console.log("Borrando base de datos de prueba");
    beforeEach(async () => {
      await resetDb();
    });

    const formData = new FormData();

    formData.append("data[userData][correo]", "todoautos@gmail.com");
    formData.append("data[userData][contrasena]", "Contra123");
    formData.append("data[userData][tipo_usuario]", "Cliente");
    formData.append("data[userData][url_foto]", "https://fotocliente.png");
    formData.append("data[userData][departamento]", "Antioquia");
    formData.append("data[userData][ciudad]", "Alejandría");
    formData.append("data[userData][direccion]", "sdfsdfsdf");

    formData.append("data[userTypeData][nombre_completo]", "sdfsdf");
    formData.append(
      "data[userTypeData][tipo_documento]",
      "Cédula de Ciudadanía"
    );
    formData.append("data[userTypeData][numero_documento]", "1090396866");
    formData.append("data[userTypeData][telefono]", "3208719438");

    const response = await request(app)
      .post("/api/v1/auth/cliente/signup")
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`
      )
      .send(formData);
    expect(response.status).toBe(201);
  });
});
