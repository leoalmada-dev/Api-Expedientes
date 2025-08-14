/**
 * @swagger
 * components:
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
 *               enum:
 *                 - interno
 *                 - externo
 *               example: interno
 *
 *     UsuarioInput:
 *       type: object
 *       required:
 *         - nombre
 *         - ci
 *         - contraseña
 *         - rolId
 *         - unidadId
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
 *
 *     UsuarioResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Usuario'
 *
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
 *           enum:
 *             - interno
 *             - externo
 *           example: externo
 *         tipo_institucion:
 *           type: string
 *           minLength: 3
 *           maxLength: 80
 *           example: juzgado
 *
 *     UnidadInput:
 *       type: object
 *       required:
 *         - nombre
 *         - tipo
 *         - tipo_institucion
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Juzgado Letrado"
 *         tipo:
 *           type: string
 *           enum:
 *             - interno
 *             - externo
 *           example: externo
 *         tipo_institucion:
 *           type: string
 *           minLength: 3
 *           maxLength: 80
 *           example: "Juzgado de Paz"
 *
 *     UnidadResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Unidad'
 *
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
 *         fecha_registro_sistema:
 *           type: string
 *           format: date-time
 *         creadoPorId:
 *           type: integer
 *         urgencia:
 *           type: string
 *           enum:
 *             - comun
 *             - urgente
 *           example: comun
 *         estado:
 *           type: string
 *           enum:
 *             - abierto
 *             - cerrado
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
 *
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
 *           enum:
 *             - comun
 *             - urgente
 *           example: urgente
 *         primer_movimiento:
 *           $ref: '#/components/schemas/MovimientoInput'
 *
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
 *           enum:
 *             - comun
 *             - urgente
 *
 *     ExpedienteResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Expediente'
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 50
 *         returned:
 *           type: integer
 *           example: 25
 *
 *     ExpedienteListResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         mensaje:
 *           type: string
 *           example: "Listado de expedientes"
 *         filtros:
 *           type: object
 *           description: Filtros aplicados en la consulta
 *           properties:
 *             fecha_desde:
 *               type: string
 *               format: date
 *               nullable: true
 *             fecha_hasta:
 *               type: string
 *               format: date
 *               nullable: true
 *             estado:
 *               type: string
 *               enum:
 *                 - abierto
 *                 - cerrado
 *               nullable: true
 *             urgencia:
 *               type: string
 *               enum:
 *                 - comun
 *                 - urgente
 *               nullable: true
 *             tipo_documento:
 *               type: string
 *               nullable: true
 *             forma_ingreso:
 *               type: string
 *               nullable: true
 *             referencia:
 *               type: string
 *               nullable: true
 *             eliminado:
 *               type: boolean
 *               nullable: true
 *             limit:
 *               type: integer
 *               example: 50
 *             page:
 *               type: integer
 *               example: 1
 *             orderBy:
 *               type: string
 *               example: "fecha_ingreso"
 *             orderDir:
 *               type: string
 *               enum:
 *                 - ASC
 *                 - DESC
 *               example: "DESC"
 *         meta:
 *           $ref: '#/components/schemas/PaginationMeta'
 *         datos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Expediente'
 *
 *     Movimiento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         expedienteId:
 *           type: integer
 *         tipo:
 *           type: string
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
 *
 *     MovimientoInput:
 *       type: object
 *       required:
 *         - tipo
 *         - fecha_movimiento
 *         - unidadDestinoId
 *       properties:
 *         tipo:
 *           type: string
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
 *
 *     MovimientoInputUpdate:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *         unidadDestinoId:
 *           type: integer
 *         unidadOrigenId:
 *           type: integer
 *         observaciones:
 *           type: string
 *
 *     MovimientoResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Movimiento'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         mensaje:
 *           type: string
 *           example: "No autorizado"
 *
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
 *
 *     ReporteUsuariosItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 3
 *         nombre:
 *           type: string
 *           example: "María Pérez"
 *         correo:
 *           type: string
 *           example: "maria@demo.com"
 *         ci:
 *           type: string
 *           example: "23456789"
 *         rol:
 *           type: string
 *           example: "Operador"
 *         unidad:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *               example: 2
 *             nombre:
 *               type: string
 *               example: "Jurídica"
 *             tipo:
 *               type: string
 *               enum:
 *                 - interno
 *                 - externo
 *               example: interno
 *             tipo_institucion:
 *               type: string
 *               example: "dependencia"
 *         total_expedientes_creados:
 *           type: integer
 *           example: 12
 *         total_movimientos_realizados:
 *           type: integer
 *           example: 45
 *         expedientes_semana:
 *           type: integer
 *           example: 2
 *         movimientos_semana:
 *           type: integer
 *           example: 7
 *         logins_ok_semana:
 *           type: integer
 *           example: 5
 *         logins_fallidos_semana:
 *           type: integer
 *           example: 1
 *         ultimo_login:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         ultima_actividad:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         activo_semana:
 *           type: boolean
 *           example: true
 *         creado_en:
 *           type: string
 *           format: date-time
 *         actualizado_en:
 *           type: string
 *           format: date-time
 *
 *     ReporteUsuariosResumen:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 4
 *         activosSemana:
 *           type: integer
 *           example: 3
 *         inactivosSemana:
 *           type: integer
 *           example: 1
 *         conIntentosFallidosSemana:
 *           type: integer
 *           example: 1
 *
 *     ReporteUsuariosResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         mensaje:
 *           type: string
 *           example: "Reporte de usuarios"
 *         filtros:
 *           type: object
 *           properties:
 *             rol:
 *               type: integer
 *               nullable: true
 *             unidadId:
 *               type: integer
 *               nullable: true
 *             buscar:
 *               type: string
 *               nullable: true
 *             activo:
 *               type: string
 *               enum:
 *                 - semana
 *               nullable: true
 *         datos:
 *           type: object
 *           properties:
 *             resumen:
 *               $ref: '#/components/schemas/ReporteUsuariosResumen'
 *             usuarios:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReporteUsuariosItem'
 *
 *     ReporteExpedienteItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         tipo_documento:
 *           type: string
 *           example: "oficio"
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *           example: "2025-07-16"
 *         estado:
 *           type: string
 *           enum:
 *             - abierto
 *             - cerrado
 *           example: "abierto"
 *         fecha_cierre:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         urgencia:
 *           type: string
 *           enum:
 *             - comun
 *             - urgente
 *           example: "comun"
 *         plazo_cumplido:
 *           description: "true = cumplido, false = incumplido, null = aún en plazo (si está abierto)"
 *           nullable: true
 *           oneOf:
 *             - type: boolean
 *             - type: "null"
 *         plazo_vencido:
 *           type: boolean
 *           description: Indica si el expediente está/estuvo vencido (equivale a plazo_cumplido === false).
 *           example: true
 *         destino:
 *           type: object
 *           nullable: true
 *           properties:
 *             tipo:
 *               type: string
 *               enum:
 *                 - interno
 *                 - externo
 *             nombre:
 *               type: string
 *               example: "Jurídica"
 *
 *     ReporteExpedientesResumen:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 25
 *         cumplieron_plazo:
 *           type: integer
 *           example: 18
 *         incumplieron_plazo:
 *           type: integer
 *           example: 4
 *         en_plazo:
 *           type: integer
 *           example: 3
 *         cerrados_fuera_plazo:
 *           type: integer
 *           example: 2
 *
 *     ReporteExpedientesResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         mensaje:
 *           type: string
 *           example: "Reporte generado correctamente"
 *         filtros:
 *           type: object
 *           properties:
 *             fecha_desde:
 *               type: string
 *               format: date
 *               nullable: true
 *             fecha_hasta:
 *               type: string
 *               format: date
 *               nullable: true
 *             rango:
 *               type: string
 *               enum:
 *                 - hoy
 *                 - semana
 *                 - mes
 *               nullable: true
 *             tipo_documento:
 *               type: string
 *               nullable: true
 *             urgencia:
 *               type: string
 *               enum:
 *                 - comun
 *                 - urgente
 *               nullable: true
 *             referencia:
 *               type: string
 *               nullable: true
 *             tipo_destino:
 *               type: string
 *               enum:
 *                 - interno
 *                 - externo
 *                 - todos
 *               nullable: true
 *             plazo:
 *               type: string
 *               enum:
 *                 - cumplido
 *                 - incumplido
 *               nullable: true
 *             limit:
 *               type: integer
 *               example: 100
 *             page:
 *               type: integer
 *               example: 1
 *             orderBy:
 *               type: string
 *               example: "fecha_ingreso"
 *             orderDir:
 *               type: string
 *               enum:
 *                 - ASC
 *                 - DESC
 *               example: "DESC"
 *         meta:
 *           $ref: '#/components/schemas/PaginationMeta'
 *         datos:
 *           type: object
 *           properties:
 *             resumen:
 *               $ref: '#/components/schemas/ReporteExpedientesResumen'
 *             expedientes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReporteExpedienteItem'
 *
 *     ActividadUsuarioResumen:
 *       type: object
 *       properties:
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             correo:
 *               type: string
 *             ci:
 *               type: string
 *             rol:
 *               type: string
 *             unidad:
 *               type: object
 *               nullable: true
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                   enum:
 *                     - interno
 *                     - externo
 *                 tipo_institucion:
 *                   type: string
 *         totales:
 *           type: object
 *           properties:
 *             expedientes_creados:
 *               type: integer
 *             movimientos_realizados:
 *               type: integer
 *             auditorias:
 *               type: integer
 *
 *     ActividadUsuarioResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         filtros:
 *           type: object
 *           properties:
 *             usuarioId:
 *               type: integer
 *             desde:
 *               type: string
 *               format: date
 *               nullable: true
 *             hasta:
 *               type: string
 *               format: date
 *               nullable: true
 *             rango:
 *               type: string
 *               enum:
 *                 - hoy
 *                 - semana
 *                 - mes
 *               nullable: true
 *             incluir:
 *               type: array
 *               items:
 *                 type: string
 *             limit:
 *               type: integer
 *             offset:
 *               type: integer
 *         datos:
 *           type: object
 *           properties:
 *             resumen:
 *               $ref: '#/components/schemas/ActividadUsuarioResumen'
 *             creados:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   tipo_documento:
 *                     type: string
 *                   numero_documento:
 *                     type: string
 *                   referencia:
 *                     type: string
 *                   fecha_ingreso:
 *                     type: string
 *                     format: date
 *                   estado:
 *                     type: string
 *                     enum:
 *                       - abierto
 *                       - cerrado
 *                   urgencia:
 *                     type: string
 *                     enum:
 *                       - comun
 *                       - urgente
 *                   ultima_actividad:
 *                     type: string
 *                     format: date-time
 *                   ultimo_movimiento:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: integer
 *                       tipo:
 *                         type: string
 *                         example: salida
 *                       fecha_movimiento:
 *                         type: string
 *                         format: date
 *                       unidadDestino:
 *                         $ref: '#/components/schemas/Unidad'
 *             movimientosRealizados:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movimiento'
 *             auditoria:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   entidad:
 *                     type: string
 *                     example: "expediente"
 *                   entidad_id:
 *                     type: integer
 *                   accion:
 *                     type: string
 *                     example: "UPDATE"
 *                   descripcion:
 *                     type: string
 *                   creado_en:
 *                     type: string
 *                     format: date-time
 */
