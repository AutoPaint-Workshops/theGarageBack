import request from "supertest";

import { app } from "../index.js";
import { describe, expect, test } from "vitest";
import { resetDb } from "./helpers/reset-db.js";
import FormData from "form-data";

import { getCompany, getUser } from "./fixtures/users.fixture.js";
import { getProduct } from "./fixtures/product.fixture.js";

describe("SignUp Company", () => {
  beforeEach(async () => {
    await resetDb();
  });

  test("Signed Company succesfully", async () => {
    const formData = new FormData();
    const binaryData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);

    const data = getCompany();

    formData.append("data", JSON.stringify(data));
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    const response = await request(app)
      .post("/api/v1/auth/empresa/signup")
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(200);

    const login = await request(app).post("/api/v1/auth/signin").send({
      correo: data.userData.correo,
      contrasena: "Contra123456",
    });
    expect(login.status).toBe(200);
    const token = login.body.meta.token;
  });
  beforeEach(async () => {
    await resetDb();
  });

  test("Signed Company fail", async () => {
    const formData = new FormData();
    const binaryData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);

    const data = getCompany();

    formData.append("data", JSON.stringify(data));
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    const response = await request(app)
      .post("/api/v1/auth/empresa/signup")
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(200);

    const faillogin = await request(app).post("/api/v1/auth/signin").send({
      correo: data.userData.correo,
      contrasena: "Contra12345*",
    });
    expect(faillogin.status).toBe(401);
  });
  beforeEach(async () => {
    await resetDb();
  });

  test("Signed Company and Create Category and Product", async () => {
    const formData = new FormData();
    const binaryData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);

    const data = getCompany();

    formData.append("data", JSON.stringify(data));
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    const response = await request(app)
      .post("/api/v1/auth/empresa/signup")
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(200);

    const login = await request(app).post("/api/v1/auth/signin").send({
      correo: data.userData.correo,
      contrasena: "Contra123456",
    });
    expect(login.status).toBe(200);
    const token = login.body.meta.token;

    const category = await request(app).post("/api/v1/categorias").send({
      nombre_categoria: "Pinturas",
    });
    expect(category.status).toBe(201);

    const dataProduct = getProduct();

    const responseProduct = await request(app)
      .post("/api/v1/productos")
      .set("Authorization", `Bearer ${token}`)
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${dataProduct.getBoundary()}`
      )
      .send(dataProduct.getBuffer());
    expect(responseProduct.status).toBe(201);

    const listProduct = await request(app).get("/api/v1/productos");
    expect(listProduct.body.data.length).toBe(1);
  }, 10000);

  test("Get All products succesfully ", async () => {
    const response = await request(app).get("/api/v1/productos");
    expect(response.status).toBe(200);
  });
});
