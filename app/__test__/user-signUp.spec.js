import request from "supertest";

import { app } from "../index.js";
import { describe, expect, test } from "vitest";
import { resetDb } from "./helpers/reset-db.js";
import FormData from "form-data";
import fs from "fs";
import img from "./0a7eed288f0f2e6efce47bee0e0ef2ae.png";
import { getUser } from "./fixtures/users.fixture.js";

describe("SignUp User", () => {
  beforeEach(async () => {
    await resetDb();
  });

  test("Signed succesfully", async () => {
    const formData = new FormData();
    const binaryData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);

    const data = getUser();

    formData.append("data", JSON.stringify(data));
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    const response = await request(app)
      .post("/api/v1/auth/cliente/signup")
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
  });
  beforeEach(async () => {
    await resetDb();
  });
  beforeEach(async () => {
    await resetDb();
  });

  test("Signed Fail", async () => {
    const formData = new FormData();
    const binaryData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    ]);

    const data = getUser();

    formData.append("data", JSON.stringify(data));
    formData.append("images", binaryData, { filename: "imagen_simulada.png" });
    const response = await request(app)
      .post("/api/v1/auth/cliente/signup")
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`
      )
      .send(formData.getBuffer());
    expect(response.status).toBe(200);

    const faillogin = await request(app).post("/api/v1/auth/signin").send({
      correo: data.userData.correo,
      contrasena: "Contra12345x",
    });
    expect(faillogin.status).toBe(401);
  });

  test("Get All products succesfully ", async () => {
    const response = await request(app).get("/api/v1/productos");
    expect(response.status).toBe(200);
  });
});
