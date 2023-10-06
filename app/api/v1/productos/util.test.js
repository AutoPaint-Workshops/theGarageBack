import { expect } from "vitest";
import { filtrarProductosPorMediana } from "./utils";

describe("utilProducts", () => {
  test("Debe filtrar productos por la mediana establecida ", () => {
    const productos = [
      {
        nombre: "1",
        valoraciones: [
          { calificacion: 3 },
          { calificacion: 4 },
          { calificacion: 5 },
        ],
      },
      { nombre: "2", valoraciones: [{ calificacion: 2 }, { calificacion: 3 }] },
      {
        nombre: "3",
        valoraciones: [
          { calificacion: 4 },
          { calificacion: 4 },
          { calificacion: 5 },
        ],
      },
    ];

    const filtroMediana = [3, 4];
    const resultadoFiltrado = filtrarProductosPorMediana(
      productos,
      filtroMediana
    );
    expect(resultadoFiltrado).toEqual([
      {
        nombre: "1",
        valoraciones: [
          { calificacion: 3 },
          { calificacion: 4 },
          { calificacion: 5 },
        ],
      },
      {
        nombre: "3",
        valoraciones: [
          { calificacion: 4 },
          { calificacion: 4 },
          { calificacion: 5 },
        ],
      },
    ]);
  });
});
