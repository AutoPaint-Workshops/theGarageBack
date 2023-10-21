export const filtrarProductosPorMediana = (result, filterMediana) => {
  return result.filter((producto) => {
    const valoraciones = producto.valoraciones;
    if (valoraciones.length === 0) {
      return false;
    }

    const calificaciones = valoraciones.map(
      (valoracion) => valoracion.calificacion
    );

    calificaciones.sort((a, b) => a - b);

    let medianaCalificaciones;

    const n = calificaciones.length;
    if (n % 2 === 1) {
      medianaCalificaciones = calificaciones[Math.floor(n / 2)];
    } else {
      const mitadInferior = calificaciones[n / 2 - 1];
      const mitadSuperior = calificaciones[n / 2];
      medianaCalificaciones = (mitadInferior + mitadSuperior) / 2;
    }

    return filterMediana.includes(medianaCalificaciones);
  });
};
