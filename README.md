# 📁 Sistema de Gestión de Expedientes - Backend

Este proyecto backend (Node.js, Express, Sequelize) administra expedientes, movimientos, unidades y usuarios, con autenticación y roles diferenciados. Utiliza validaciones robustas con `express-validator`, asegurando integridad y seguridad de datos.

---

## 🛠️ Tecnologías y Herramientas

- **Node.js + Express**
- **Sequelize ORM (MySQL)**
- **JWT** (Autenticación)
- **bcryptjs** (Encriptado de contraseñas)
- **express-validator** (Validación de datos)
- **helmet** (Seguridad HTTP headers)
- **express-rate-limit** (Rate limiting)
- **Morgan** (Logs en consola)
- **CORS** (Cross-Origin Resource Sharing)
- **Swagger/OpenAPI**

---

## 🔄 Estructura del Proyecto

```
src/
├── config/
│   ├── database.js
│   └── swagger.js
├── controllers/
│   ├── authController.js
│   ├── expedienteController.js
│   ├── movimientoController.js
│   ├── unidadController.js
│   └── usuarioController.js
├── helpers/
│   ├── registrarAuditoria.js
│   └── registrarLoginIntento.js
├── middleware/
│   ├── verifyToken.js
│   ├── loginLimiter.js
│   └── generalLimiter.js
├── models/
│   ├── Auditoria.js
│   ├── Expediente.js
│   ├── Movimiento.js
│   ├── Unidad.js
│   ├── Usuario.js
│   ├── Rol.js
│   ├── LogEliminacion.js
│   └── index.js
├── routes/
│   ├── auth.js
│   ├── expediente.js
│   ├── movimiento.js
│   ├── unidad.js
│   └── usuario.js
├── validations/
│   ├── authValidator.js
│   ├── expedienteValidator.js
│   ├── movimientoValidator.js
│   ├── unidadValidator.js
│   └── usuarioValidator.js
└── app.js

```

---

## 🛡️ Seguridad y Buenas Prácticas

- Headers seguros (helmet)
- Rate limiting para login y toda la API
- CORS restringido a orígenes confiables
- Auditoría: todas las acciones críticas quedan registradas (usuario, acción, IP, detalles, timestamp)
- Registro de intentos de login: exitosos, fallidos y bloqueados (usuario, IP, motivo, timestamp)
- Autenticación JWT en todas las rutas protegidas
- Control de roles: validación estricta por endpoint
- Variables de entorno para claves y datos sensibles
- Sincronización automática de base de datos solo en desarrollo (usá migraciones en producción)

---

## 🔐 Usuarios Predefinidos

| Usuario (CI) | Contraseña    | Rol          |
| ------------ | ------------- | ------------ |
| 12345678     | admin123      | Admin        |
| 23456789     | supervisor123 | Supervisor   |
| 34567890     | operador123   | Operador     |
| 45678901     | visual123     | Visualizador |

---

## 🚩 Endpoints Principales

### **Autenticación (`/auth`)**

- **POST** `/auth/login`

```json
{
  "usuario": "12345678",
  "contraseña": "admin123"
}
```

### **Usuarios (`/usuarios`)**

- GET `/usuarios` (admin, supervisor)
- POST `/usuarios` (admin, supervisor)
- PUT `/usuarios/:id` (admin, supervisor)
- DELETE `/usuarios/:id` (admin, supervisor)

```json
{
  "nombre": "Nuevo Usuario",
  "ci": "11223344",
  "correo": "nuevo@usuario.com",
  "contraseña": "usuario123",
  "rolId": 3,
  "unidadId": 1
}
```

### **Unidades (`/unidades`)**

- GET `/unidades` (todos los roles)
- POST `/unidades` (admin, supervisor)
- PUT `/unidades/:id` (admin, supervisor)
- DELETE `/unidades/:id` (admin, supervisor)

```json
{
  "nombre": "Jefatura de Policía",
  "tipo": "interno" // o "externo"
}
```

### **Expedientes (`/expedientes`)**

- POST `/expedientes` crea un expediente y, en la misma petición, crea su primer movimiento de entrada (Ejemplo mas abajo)
- GET `/expedientes` (todos los roles)
  Devuelve todos los expedientes si no le aplicas filtros.
  Ejemplo con filtros: `/expedientes?tipo_documento=oficio&fecha_desde=2025-07-01&fecha_hasta=2025-07-31`
  (Se pueden utilizar uno o mas filtros)

│ Parámetros para el FILTRO:
│ - tipo_documento (string): "oficio", "apia", "memo", "fisico", "otro"
│ - fecha_desde (YYYY-MM-DD)
│ - fecha_hasta (YYYY-MM-DD)
│ - estado (string): "cerrado", "abierto" (Una vez cerrado no se pueden asignar mas movimientos ni editar movimientos del mismo, solo se puede reabrir por el supervisor y esto qeda registrado)
│ - eliminados (true): Solo para rol supervisor, para listar expedientes eliminados
│ Ejemplo eliminados: GET `/expedientes?eliminados=true`
│ Si no se incluye eliminados solo se muestran los expedientes activos (no eliminados).

- GET `/expedientes/:id` Obtener expediente por ID
- PUT `/expedientes/:id` Actualizar expediente (Supervisor, admin)
- DELETE `/expedientes/:id` Eliminar expediente (lógico) (Supervisor, admin)
- POST `/expedientes/:id/cerrar` Cerrar expediente (Supervisor)
- POST `/expedientes/:id/reabrir` Reabrir expediente (Supervisor)
- POST `/expedientes/:expedienteId/movimientos` Crear movimiento para expediente
  (Ejemplo mas abajo en Seccion Movimientos)

Ejemplo para crear expediente (con movimiento):
POST `/expedientes`

```json
{
  "tipo_documento": "oficio",
  "numero_documento": "N.º 100/2025",
  "forma_ingreso": "correo",
  "fecha_ingreso": "2025-07-16",
  "referencia": "Solicitud",
  "detalle": "Detalles adicionales",
  "caracter": "urgente", // o "comun"
  "primer_movimiento": {
    "tipo": "entrada",
    "fecha_movimiento": "2025-07-16",
    "unidadDestinoId": 1,
    "observaciones": "Ingreso inicial"
  }
}
```

Ejemplo para actualizar expediente:
(podes enviar solo la variable q vas a actualizar)

- PUT /expedientes/1

```json
{
  "detalle": "Nuevo detalle del expediente"
}
```

### **Movimientos (`/expedientes/:expedienteId/movimientos`)**

- PUT `/movimientos/:id` Actualizar movimiento (Supervisor, admin)
- DELETE `/movimientos/:id` Eliminar movimiento (lógico) (Supervisor, admin)
- GET `/movimientos/:expedienteId/historial` Obtener historial completo de un expediente (todos los roles)
- POST `/expedientes/:expedienteId/movimientos` Crear movimiento para expediente (todos menos visualizador)

Ejemplo para crear movimiento:
POST /expedientes/1/movimientos

```json
{
  "tipo": "salida",
  "fecha_movimiento": "2025-07-17",
  "unidadDestinoId": 2,
  "unidadOrigenId": 1,
  "observaciones": "Envío a Jurídica"
}
```

Ejemplo para actualizar movimiento:
(podes enviar solo la variable q vas a actualizar)

PUT /movimientos/5

```json
{
  "observaciones": "Observaciones editadas"
}
```

---

## Reportes

### Autenticación y roles

Todos los endpoints requieren **JWT** (header `Authorization: Bearer <token>`).

- **/reportes/usuarios** → `admin`, `supervisor`
- **/reportes/expedientes** → `admin`, `supervisor`, `operador`
- **/reportes/usuarios/:usuarioId/actividad** → `admin`, `supervisor` o el **propio usuario**

### GET /reportes/usuarios

**Descripción:** Métricas por usuario (totales históricos, actividad última semana, logins).

**Query params**

- `rol` _(int)_ — filtra por `rolId`
- `unidadId` _(int)_ — filtra por unidad
- `buscar` _(string)_ — nombre/correo/CI (like)
- `activo` = `semana` _(opcional)_ — solo usuarios con actividad en la última semana

**Respuesta (resumen)**

```json
{
  "ok": true,
  "datos": {
    "resumen": {
      "total": 4,
      "activosSemana": 3,
      "inactivosSemana": 1,
      "conIntentosFallidosSemana": 1
    },
    "usuarios": [ /* ReporteUsuariosItem[] */ ]
  }
}
```

**Ejemplo**
```bash
curl -H "Authorization: Bearer $TOKEN" \"http://localhost:3000/reportes/usuarios?activo=semana&buscar=maria"
```

### GET /reportes/expedientes

**Descripción:** Lista de expedientes con plazo y destino del último movimiento de salida.

**Incluye:**

- plazo_cumplido: true (cumplido), false (incumplido/vencido), null (abierto y aún en plazo)
- plazo_vencido: boolean derivado (plazo_cumplido === false)
- Query params
- Fechas: fecha_desde, fecha_hasta (YYYY-MM-DD) o rango ∈ hoy|semana|mes
- Filtros: tipo_documento, urgencia ∈ comun|urgente, referencia (like)
- Destino: tipo_destino ∈ interno|externo|todos
- Plazo: plazo ∈ cumplido|incumplido
- Paginación/orden: limit (≤ 200), page (≥ 1), orderBy ∈ fecha_ingreso|fecha_cierre|urgencia|estado|id, orderDir ∈ ASC|DESC

**Respuesta (resumen + meta)**
```json
{
  "ok": true,
  "meta": { "page": 1, "limit": 50, "returned": 25 },
  "datos": {
    "resumen": {
      "total": 25,
      "cumplieron_plazo": 18,
      "incumplieron_plazo": 4,
      "en_plazo": 3,
      "cerrados_fuera_plazo": 2
    },
    "expedientes": [
      {
        "id": 10,
        "tipo_documento": "oficio",
        "fecha_ingreso": "2025-07-16",
        "estado": "abierto",
        "fecha_cierre": null,
        "urgencia": "comun",
        "plazo_cumplido": null,
        "plazo_vencido": false,
        "destino": { "tipo": "interno", "nombre": "Jurídica" }
      }
    ]
  }
}
```

**Ejemplo**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/reportes/usuarios?activo=semana&buscar=maria"
```

### GET /reportes/usuarios/:usuarioId/actividad

**Descripción:** Actividad detallada del usuario: expedientes creados, movimientos realizados y auditoría (si aplica).
El acceso está restringido: el propio usuario o admin/supervisor.

**Query params**
- _Fechas_: desde, hasta (YYYY-MM-DD) o rango ∈ hoy|semana|mes
- _Secciones_: incluir CSV (ej. creados,movimientos,auditoria)
- _Paginación_: limit (≤ 200), offset (≥ 0)

**Ejemplo**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/reportes/usuarios/3/actividad?rango=semana&incluir=creados,movimientos&limit=10&offset=0"
```

---

## Auditoría y Logs

- Auditoría completa: Todas las acciones de creación, edición y borrado de expedientes, movimientos, usuarios y unidades quedan registradas (quién, cuándo, IP, acción y detalle).
- Intentos de login: Todos los intentos de login (exitosos, fallidos, bloqueados) quedan registrados (usuario, IP, motivo, timestamp).

---

## ✅ Validaciones

- Todas las entradas pasan por express-validator.
- Campos obligatorios, formatos, opciones válidas (urgencia, tipo de unidad, etc).
- Errores claros y uniformes.

---

## 🚦 Respuestas uniformes

Todas las respuestas siguen el formato:

```json
{
  "ok": true, // o false,
  "mensaje": "Mensaje claro en español",
  "datos": {}
}
```

---

## 📑 Documentación Swagger (OpenAPI)

- Acceso: http://localhost:3000/api-docs
- Documentación interactiva y actualizada de todos los endpoints, ejemplos y schemas detallados.
- Refleja todos los cambios de auditoría, seguridad, filtros y validaciones.

---

## 🖥️ Configuración del servidor

Crear archivo `.env` en raíz del proyecto:

```
PORT=3000
JWT_SECRET=tu_jwt_secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=expedientes_db
```

### Instalación y ejecución:

```bash
npm install
npm start # o node src/server.js
```

│ Nota: En producción, usá migraciones (sequelize-cli db:migrate).
│ sequelize.sync() debe usarse solo en desarrollo.

---

## 🧑‍💻 Tests automáticos

- Tests con Jest/Supertest para rutas, roles, validaciones y auditoría.
- Cobertura de flujos críticos y errores.

---

### 🚀 Estado Actual

Backend profesional, seguro, validado y auditado.
Listo para integración frontend y despliegue productivo.
