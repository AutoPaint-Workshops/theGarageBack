export const filtrarProductosPorCalificacion = (result, filterCalificacion) => {
  return result.filter((producto) => {
    const valoraciones = producto.valoraciones;
    if (valoraciones.length === 0) {
      return false;
    }

    const sumaCalificaciones = valoraciones.reduce(
      (sum, val) => sum + val.calificacion,
      0
    );
    const calificacionPromedio = Math.round(
      sumaCalificaciones / valoraciones.length
    );

    return filterCalificacion.includes(calificacionPromedio);
  });
};
