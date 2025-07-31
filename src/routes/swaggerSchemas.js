/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Leonardo Almada
 *         correo:
 *           type: string
 *           example: leoalmada@correo.com
 *         ci:
 *           type: string
 *           example: "12345678"
 *         rolId:
 *           type: integer
 *           example: 1
 *         unidadId:
 *           type: integer
 *           example: 2
 *         Rol:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *               example: Admin
 *         Unidad:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *               example: "Jefatura de Policía"
 *             tipo:
 *               type: string
 *               enum: [interno, externo]
 *               example: interno
 *     UsuarioInput:
 *       type: object
 *       required: [nombre, ci, correo, contraseña, rolId, unidadId]
 *       properties:
 *         nombre:
 *           type: string
 *           example: Leonardo Almada
 *         ci:
 *           type: string
 *           example: "12345678"
 *         correo:
 *           type: string
 *           example: leoalmada@correo.com
 *         contraseña:
 *           type: string
 *           example: usuario123
 *         rolId:
 *           type: integer
 *           example: 1
 *         unidadId:
 *           type: integer
 *           example: 2
 *     UsuarioResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Usuario'
 *     Unidad:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nombre:
 *           type: string
 *           example: "Juzgado Letrado"
 *         tipo:
 *           type: string
 *           enum: [interno, externo]
 *           example: externo
 *     UnidadInput:
 *       type: object
 *       required: [nombre, tipo]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Juzgado Letrado"
 *         tipo:
 *           type: string
 *           enum: [interno, externo]
 *           example: externo
 *     UnidadResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Unidad'
 *     Expediente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         tipo_documento:
 *           type: string
 *           example: oficio
 *         numero_documento:
 *           type: string
 *           example: "N.º 100/2025"
 *         forma_ingreso:
 *           type: string
 *           example: correo
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *           example: "2025-07-16"
 *         referencia:
 *           type: string
 *           example: "Solicitud"
 *         detalle:
 *           type: string
 *           example: "Detalles adicionales"
 *         creadoPorId:
 *           type: integer
 *         urgencia:
 *           type: string
 *           enum: [comun, urgente]
 *           example: comun
 *         estado:
 *           type: string
 *           enum: [abierto, cerrado]
 *           example: abierto
 *         cerradoPorId:
 *           type: integer
 *         fecha_cierre:
 *           type: string
 *           format: date-time
 *         eliminado:
 *           type: boolean
 *         creador:
 *           $ref: '#/components/schemas/Usuario'
 *     ExpedienteInput:
 *       type: object
 *       required:
 *         - tipo_documento
 *         - numero_documento
 *         - forma_ingreso
 *         - fecha_ingreso
 *         - urgencia
 *       properties:
 *         tipo_documento:
 *           type: string
 *           example: oficio
 *         numero_documento:
 *           type: string
 *           example: "N.º 100/2025"
 *         forma_ingreso:
 *           type: string
 *           example: correo
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *           example: "2025-07-16"
 *         referencia:
 *           type: string
 *           example: "Solicitud"
 *         detalle:
 *           type: string
 *           example: "Detalles adicionales"
 *         urgencia:
 *           type: string
 *           enum: [comun, urgente]
 *           example: urgente
 *         primer_movimiento:
 *           $ref: '#/components/schemas/MovimientoInput'
 *     ExpedienteUpdate:
 *       type: object
 *       properties:
 *         tipo_documento:
 *           type: string
 *         numero_documento:
 *           type: string
 *         forma_ingreso:
 *           type: string
 *         fecha_ingreso:
 *           type: string
 *         referencia:
 *           type: string
 *         detalle:
 *           type: string
 *         urgencia:
 *           type: string
 *           enum: [comun, urgente]
 *     ExpedienteResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Expediente'
 *     Movimiento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         expedienteId:
 *           type: integer
 *         tipo:
 *           type: string
 *           enum: [entrada, salida]
 *           example: entrada
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *           example: "2025-07-17"
 *         unidadDestinoId:
 *           type: integer
 *         unidadOrigenId:
 *           type: integer
 *         observaciones:
 *           type: string
 *           example: "Envío a Jurídica"
 *         eliminado:
 *           type: boolean
 *         usuarioId:
 *           type: integer
 *         unidadDestino:
 *           $ref: '#/components/schemas/Unidad'
 *         unidadOrigen:
 *           $ref: '#/components/schemas/Unidad'
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *     MovimientoInput:
 *       type: object
 *       required:
 *         - tipo
 *         - fecha_movimiento
 *         - unidadDestinoId
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [entrada, salida]
 *           example: salida
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *           example: "2025-07-17"
 *         unidadDestinoId:
 *           type: integer
 *           example: 2
 *         unidadOrigenId:
 *           type: integer
 *           example: 1
 *         observaciones:
 *           type: string
 *           example: "Envío a Jurídica"
 *     MovimientoInputUpdate:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [entrada, salida]
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *         unidadDestinoId:
 *           type: integer
 *         unidadOrigenId:
 *           type: integer
 *         observaciones:
 *           type: string
 *     MovimientoResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Movimiento'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         mensaje:
 *           type: string
 *           example: "No autorizado"
 *     ErrorValidationResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         mensaje:
 *           type: string
 *           example: "Datos inválidos"
 *         errores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *                 example: "El nombre de la unidad es obligatorio"
 *               param:
 *                 type: string
 *                 example: "nombre"
 */
