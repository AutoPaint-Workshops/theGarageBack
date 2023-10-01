export const filtrarProductosPorCalificacion = (result, filterCalificacion) => {
  return result.filter((producto) => {
    const valoraciones = producto.valoraciones;
    if (valoraciones.length === 0) {
      return false;
    }

    let sumaCalificaciones = 0;

    valoraciones.forEach((valoracion) => {
      sumaCalificaciones += valoracion.calificacion;
    });

    const calificacionPromedio = Math.round(
      sumaCalificaciones / valoraciones.length
    );

    return filterCalificacion.includes(calificacionPromedio);
  });
};
