export const filtrarServiciosPorCalificacion = (result, filterCalificacion) => {
  return result.filter((servicio) => {
    const valoraciones = servicio.valoraciones;
    // si no hay valoraciones, no se puede calcular el promedio, por lo tanto no se incluye en el resultado
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
