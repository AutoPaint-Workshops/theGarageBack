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
    const data = {
      userData: {
        correo: "julioJaramillo8@gmail.com",
        contrasena: "Contra123",
        tipo_usuario: "Cliente",
        url_foto: "https://fotocliente.png",
        departamento: "Antioquia",
        ciudad: "Medellín",
        direccion: "dfgdfg",
      },
      userTypeData: {
        nombre_completo: "dfgdf",
        tipo_documento: "Cédula de Extranjería",
        numero_documento: "32423423j4",
        telefono: "23423423432",
      },
    };

    formData.append("data", JSON.stringify(data));
    formData.append("images", "https://fotocliente.png");

    const response = await request(app)
      .post("/api/v1/auth/cliente/signup")
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(201);
  });
});
