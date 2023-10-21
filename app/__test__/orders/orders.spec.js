import request from "supertest";
import { describe, expect, test } from "vitest";
import { app } from "../../index.js";
import { resetDb } from "../helpers/reset-db.js";
import {
  createCategories,
  createOrdersProducts,
  createProducts,
  addStateToOrder,
} from "../helpers/createProducts.js";

import { getAdminUser, getUsers } from "../helpers/createProfiles.js";
import { getAuth } from "../helpers/getAuth.js";

describe("Order Productos tests", () => {
  beforeEach(async () => {
    await resetDb();
  });

  test("Create an order with productos", async () => {
    const cliente = await getUsers("cliente");
    const token = getAuth(cliente);
    const empresa = await getUsers("empresa");
    const id_empresa = empresa.userTypeData.id;
    const categorias = await createCategories();
    const producto1 = await createProducts(id_empresa, categorias);
    const producto2 = await createProducts(id_empresa, categorias);
    const total = producto1.precio + producto2.precio;
    const body = {
      ordenProductos: {
        total,
        id_empresa,
      },
      detallesOrdenProductos: [
        {
          id_producto: producto1.id,
          cantidad: 1,
          precio_unitario: producto1.precio,
        },
        {
          id_producto: producto2.id,
          cantidad: 1,
          precio_unitario: producto2.precio,
        },
      ],
    };
    const response = await request(app)
      .post("/api/v1/orden_productos")
      .set("Authorization", `Bearer ${token}`)
      .send(body);
    expect(response.status).toBe(200);
    expect(response.body.paymentUrl).toBeTruthy();

    const badRequest = await request(app)
      .post("/api/v1/orden_productos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ordenProductos: {},
        detallesOrdenProductos: [],
      });
    expect(badRequest.status).toBe(500);
  });

  test("Create an order with bad productos quantyties", async () => {
    const cliente = await getUsers("cliente");
    const token = getAuth(cliente);
    const empresa = await getUsers("empresa");
    const id_empresa = empresa.userTypeData.id;
    const categorias = await createCategories();
    const producto1 = await createProducts(id_empresa, categorias);
    const total = producto1.precio * (producto1.cantidad_disponible + 1);
    const body = {
      ordenProductos: {
        total,
        id_empresa,
      },
      detallesOrdenProductos: [
        {
          id_producto: producto1.id,
          cantidad: producto1.cantidad_disponible + 1,
          precio_unitario: producto1.precio,
        },
      ],
    };
    const badRequest = await request(app)
      .post("/api/v1/orden_productos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ordenProductos: {},
        detallesOrdenProductos: [],
      });
    expect(badRequest.status).toBe(500);
  });

  test("Find all the orders with products", async () => {
    const admin = await getAdminUser();
    const token = getAuth(admin);

    const cliente = await getUsers("cliente");
    const tokenCliente = getAuth(cliente);
    const cliente2 = await getUsers("cliente");
    await createOrdersProducts(cliente);
    await createOrdersProducts(cliente2);
    const all = await request(app)
      .get("/api/v1/orden_productos")
      .set("Authorization", `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.data.length).toBe(2);
    const allCliente = await request(app)
      .get("/api/v1/orden_productos")
      .set("Authorization", `Bearer ${tokenCliente}`);
    expect(allCliente.status).toBe(200);
    expect(allCliente.body.data.length).toBe(1);
  });

  test("update order state", async () => {
    //  const admin = await getAdminUser();
    const empresa = await getUsers("empresa");
    const cliente = await getUsers("cliente");
    const tokenCliente = getAuth(cliente);
    const tokenEmpresa = getAuth(empresa);
    const orderPagada = await createOrdersProducts(cliente);
    const { result } = orderPagada;
    const { id } = result;

    const orderEnviada = await createOrdersProducts(cliente);
    const { result: resultEnviada } = orderEnviada;
    const { id: idEnviada } = resultEnviada;
    const resState = await addStateToOrder(idEnviada, "Enviada");

    const estadoOrden = await request(app)
      .put(`/api/v1/orden_productos/${id}`)
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({ estado: "Cancelada" });
    expect(estadoOrden.status).toBe(200);
    expect(estadoOrden.body.message).toBe("Estado actualizado");

    const estadoOrdenPagada = await request(app)
      .put(`/api/v1/orden_productos/${id}`)
      .set("Authorization", `Bearer ${tokenEmpresa}`)
      .send({ estado: "Enviada" });
    expect(estadoOrdenPagada.status).toBe(400);
    expect(estadoOrdenPagada.body.message).toBe(
      "No se pudo realizar el cambio de estado, la orden se encuentra cancelada"
    );

    const estadoOrdenEnviada = await request(app)
      .put(`/api/v1/orden_productos/${idEnviada}`)
      .set("Authorization", `Bearer ${tokenEmpresa}`)
      .send({ estado: "Entregada" });
    expect(estadoOrdenEnviada.status).toBe(200);
    expect(estadoOrdenEnviada.body.message).toBe("Estado actualizado");
  });
});
