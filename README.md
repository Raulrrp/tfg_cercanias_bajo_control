# tfg_cercanias_bajo_control
```mermaid
gantt
    title Planificación Original del Proyecto
    dateFormat  YYYY-MM-DD
    axisFormat  %d-%b
    %% Con este parámetro aumentamos el margen de la izquierda para los títulos
    leftPadding 150 

    section Preparación de datos
    Descarga y limpieza de datos :active, 2026-02-15, 2026-02-22
    
    section Diseño de arquitectura
    Decisión de arquitectura : 2026-02-22, 2026-03-01
    
    section Mapa de visualización
    Estaciones, líneas y flotas en vivo : 2026-03-01, 2026-03-22
    
    section Info. estaciones y trenes
    Información de trenes y horarios : 2026-03-22, 2026-03-30
    
    section Filtros e incidencias
    Incidencias y filtros : 2026-03-30, 2026-04-20
    
    section Ingesta de datos
    Llegadas en tiempo real : 2026-04-20, 2026-05-12
    
    section Ventana de análisis
    Gestión e ingesta de cuadro de mando : 2026-05-12, 2026-05-26
    
    section Pruebas y mejoras
    Pruebas y mejoras finales : 2026-05-26, 2026-06-22
