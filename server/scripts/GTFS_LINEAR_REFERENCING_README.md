# GTFS Realtime Linear Referencing Engine

## Descripción General

Este conjunto de scripts implementa un motor de **referenciación lineal** para proyectar la posición exacta de vehículos en tiempo real sobre las geometrías estáticas de las rutas GTFS. Permite determinar de manera fiable si un vehículo ya ha pasado una parada o está acercándose a ella, sin depender del campo `current_status` del feed GTFS-Realtime (que suele ser poco fiable).

## Teoría: Referenciación Lineal (Linear Referencing)

### ¿Qué es?

La referenciación lineal es una técnica GIS que localiza puntos geográficos a lo largo de una línea. En lugar de usar solo coordenadas lat/lon, usamos la **distancia acumulada desde el inicio de la línea**.

### ¿Por qué es útil?

- **Posición continua**: Se expresa como una distancia a lo largo de la ruta, no como puntos discretos
- **Comparación de posiciones**: Es trivial comparar si un vehículo pasó una parada: `distancia_vehículo >= distancia_parada`
- **Independencia del estado del vehículo**: No depende de campos poco confiables como `current_status`

### Proceso Paso a Paso

```
1. Vincular (Link)
   trip_id → shape_id (mediante trips.txt)
   
2. Construir Geometría
   shape_id → LineString (secuencia de puntos shape_pt_* ordenados)
   
3. Proyectar Parada (Project Stop)
   stop_id → coordenadas lat/lon
   → proyectar sobre LineString
   → obtener distancia desde inicio de ruta
   
4. Proyectar Vehículo (Snap Vehicle)
   lat/lon de GPS → punto más cercano en LineString
   → obtener distancia desde inicio de ruta
   
5. Comparar
   si: distancia_vehículo >= distancia_parada  → PASSED
   si: distancia_vehículo < distancia_parada   → APPROACHING
```

## Archivos

### 1. `gtfs-realtime-linear-reference.js`

**Propósito**: Motor principal que implementa la lógica de referenciación lineal.

#### Clases principales:

**`GTFSDataStore`**
- Carga y cachea todos los datos estáticos GTFS
- Métodos:
  - `loadStops(filePath)` - Carga stops.txt
  - `loadShapes(filePath)` - Carga shapes.txt  
  - `loadTrips(filePath)` - Carga trips.txt
  - `loadStopTimes(filePath)` - Carga stop_times.txt
  - `buildRouteGeometries()` - Pre-construye todas las LineStrings
  - `loadAll()` - Carga todo (uso recomendado)

**`LinearReferenceEngine`**
- Implementa la lógica de proyección y comparación
- Métodos públicos:
  - `getShapeIdFromTripId(tripId)` - Obtiene shape_id de un trip_id
  - `getStopCoordinates(stopId)` - Obtiene lat/lon de una parada
  - `projectPointOnLine(point, lineString)` - Proyecta un punto GPS en la línea
  - `getStopDistanceAlongRoute(tripId, stopId, lineString)` - Distancia de parada
  - `determineStopStatus(trainDist, stopDist, tolerance)` - Compara distancias
  - `processVehicle(vehicleData)` - Procesa un vehículo completo

#### Nota sobre `shape_dist_traveled`:

Si el archivo **stop_times.txt** contiene la columna `shape_dist_traveled`, el script la usa directamente (es lo más preciso). Si no existe, proyecta las coordenadas de la parada sobre la ruta.

### 2. `gtfs-realtime-feed-processor.js`

**Propósito**: Utilidad para procesar feeds completos de GTFS-RT y exportar resultados.

#### Funciones principales:

- `extractVehiclesFromGtfsRtFeed(gtfsRtFeed)` - Extrae vehículos del JSON de GTFS-RT
- `processGtfsRtFeed(gtfsRtFilePath, dataStore)` - Procesa un archivo JSON completo
- `outputResults(results, outputPath, format)` - Exporta en JSON, CSV o GeoJSON

## Instalación

### Requisitos

- Node.js >= 14
- npm o yarn

### Dependencias

```bash
npm install @turf/turf csv-parse
```

O agregar al `package.json`:

```json
{
  "dependencies": {
    "@turf/turf": "^6.5.0",
    "csv-parse": "^5.0.0 o superior"
  },
  "type": "module"
}
```

### Estructura de Archivos GTFS Esperada

```
server/
├── data_files/
│   ├── stops.txt              (requerido)
│   ├── trips.txt              (requerido)
│   ├── stop_times.txt         (requerido)
│   └── shapes/
│       └── shapes.txt         (requerido)
└── scripts/
    ├── gtfs-realtime-linear-reference.js
    └── gtfs-realtime-feed-processor.js
```

## Uso

### Opción 1: Ejecutar el Motor Directo

```bash
node server/scripts/gtfs-realtime-linear-reference.js
```

**Salida**: Procesa vehículos de ejemplo hardcodeados en el script.

```
Vehicle 23639:
  Trip: 3015M23639C4 | Stop: 51003 (Parada XYZ)
  Vehicle distance: 12.34 km
  Stop distance: 12.50 km
  Difference: -0.16 km
  Status: APPROACHING
```

### Opción 2: Como Módulo de Node.js

```javascript
import { GTFSDataStore, LinearReferenceEngine } from './gtfs-realtime-linear-reference.js';

// Cargar datos
const dataStore = new GTFSDataStore();
await dataStore.loadAll();

// Crear motor
const lrEngine = new LinearReferenceEngine(dataStore);

// Procesar vehículo
const result = lrEngine.processVehicle({
    vehicleId: '23639',
    tripId: '3015M23639C4',
    stopId: '51003',
    latitude: 37.392242,
    longitude: -5.974642,
    timestamp: '1777382511'
});

console.log(result);
// {
//   vehicleId: '23639',
//   tripId: '3015M23639C4',
//   stopId: '51003',
//   stopName: 'Puerta de Alcalá',
//   linearReferencing: {
//     vehicleDistanceAlongRoute: 12.34,
//     stopDistanceAlongRoute: 12.50,
//     stopStatus: 'APPROACHING'
//   }
// }
```

### Opción 3: Procesar Feed Completo

```javascript
import { GTFSDataStore } from './gtfs-realtime-linear-reference.js';
import { processGtfsRtFeed, outputResults } from './gtfs-realtime-feed-processor.js';

// Cargar datos
const dataStore = new GTFSDataStore();
await dataStore.loadAll();

// Procesar feed
const results = await processGtfsRtFeed('realtime-feed.json', dataStore);

// Exportar resultados
outputResults(results, 'output.json', 'json');       // JSON
outputResults(results, 'output.csv', 'csv');         // CSV
outputResults(results, 'output.geojson', 'geojson'); // GeoJSON
```

## Formato de Entrada: GTFS-RT JSON

```json
{
  "header": {
    "gtfsRealtimeVersion": "2.0",
    "timestamp": "1777382518"
  },
  "entity": [
    {
      "id": "VP_C4-23639",
      "vehicle": {
        "trip": {
          "tripId": "3015M23639C4"
        },
        "position": {
          "latitude": 37.392242,
          "longitude": -5.974642
        },
        "currentStatus": "INCOMING_AT",
        "timestamp": "1777382511",
        "stopId": "51003",
        "vehicle": {
          "id": "23639",
          "label": "C4-23639-PLATF.(8)"
        }
      }
    },
    {...}
  ]
}
```

## Formato de Salida

### JSON

```json
{
  "vehicleId": "23639",
  "tripId": "3015M23639C4",
  "stopId": "51003",
  "stopName": "Parada XYZ",
  "linearReferencing": {
    "shapeId": "30_C4",
    "vehicleDistanceAlongRoute": 12.34,
    "stopDistanceAlongRoute": 12.50,
    "distanceDifference": -0.16,
    "stopStatus": "APPROACHING",
    "distanceSource": "projection"
  }
}
```

### CSV

```
vehicleId,tripId,stopId,stopName,stopStatus,vehicleDistanceKm,stopDistanceKm
23639,3015M23639C4,51003,Parada XYZ,APPROACHING,12.340,12.500
```

### GeoJSON

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-5.974642, 37.392242]
      },
      "properties": {
        "vehicleId": "23639",
        "stopStatus": "APPROACHING"
      }
    }
  ]
}
```

## Campos de Salida Explicados

| Campo | Descripción |
|-------|-------------|
| `vehicleId` | ID del vehículo |
| `tripId` | ID del viaje |
| `stopId` | ID de la parada |
| `stopName` | Nombre de la parada |
| `stopStatus` | Estado: `PASSED`, `AT_STOP`, `APPROACHING` |
| `vehicleDistanceAlongRoute` | Distancia acumulada del vehículo (km) |
| `stopDistanceAlongRoute` | Distancia acumulada de la parada (km) |
| `distanceDifference` | Resta: vehículo - parada (km) |
| `distanceSource` | Origen del cálculo: `shapeDist` o `projection` |
| `projectedVehicleLocation` | Coords. del punto proyectado en la ruta |

## Parámetros de Configuración

En `gtfs-realtime-linear-reference.js`, al inicio del archivo:

```javascript
// Tolerancia para considerarse "en la parada" (en km)
const PROJECTION_TOLERANCE_KM = 0.5; // 500 metros

// En LinearReferenceEngine.determineStopStatus():
determineStopStatus(trainDistanceKm, stopDistanceKm, toleranceKm = 0.1)
// Por defecto 0.1 km = 100 metros
```

Ajusta estos valores según tu caso de uso.

## Casos de Uso

### 1. Sistema de Alertas de Paradas

```javascript
const result = lrEngine.processVehicle(vehicle);

if (result.linearReferencing.stopStatus === 'AT_STOP') {
    notifyPassengers('Próxima parada: ' + result.stopName);
} else if (result.linearReferencing.stopStatus === 'PASSED') {
    recordPassedStop(result.vehicleId, result.stopId);
}
```

### 2. Dashboard de Seguimiento

Visualizar todos los vehículos con su estado proyectado en la ruta (exportar a GeoJSON y renderizar en un mapa).

### 3. Validación de Datos GTFS

Comparar las distancias calculadas con `shape_dist_traveled` para detectar inconsistencias en los datos estáticos.

## Notas Importantes

1. **Rendimiento**: Con trips y stops grandes, pre-construir todas las geometrías (`buildRouteGeometries()`) es crítico.

2. **Precisión**: 
   - Depende de la calidad de los datos GTFS (shapes.txt) y las coordenadas GPS.
   - La tolerancia de proyección (`PROJECTION_TOLERANCE_KM`) afecta la precisión del snapping.

3. **shape_dist_traveled**: 
   - Si existe en stop_times.txt, úsalo (es más preciso que proyectar).
   - Si no existe, el script proyecta automáticamente.

4. **Manejo de errores**: El script valida que los datos existan antes de procesarlos y registra advertencias.

5. **Unidades**: 
   - Distancias en **kilómetros**.
   - Coordenadas en **lat/lon (WGS84)**.

## Troubleshooting

### "Shape {id} not found in route geometries"
- Verifica que `trips.txt` tenga un `shape_id` para el trip.
- Verifica que ese `shape_id` exista en `shapes.txt`.

### "Could not project point on line"
- La posición GPS puede estar muy lejos de la ruta.
- Comprueba la precisión de las coordenadas GPS.

### Distancias incorrectas
- Verifica que `shapes.txt` esté ordenado por `shape_pt_sequence`.
- Comprueba si `shape_dist_traveled` en `stop_times.txt` es correcto.

## Referencias

- [GTFS Specification](https://gtfs.org/)
- [GTFS-Realtime Specification](https://gtfs.org/documentation/realtime/reference/)
- [Turf.js Documentation](https://turfjs.org/)
- [Linear Referencing (Wikipedia)](https://en.wikipedia.org/wiki/Linear_referencing)

---

**Autor**: GIS Data Engineer  
**Fecha**: 2026-04-28  
**Versión**: 1.0.0
