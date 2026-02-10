import {z} from 'zod'

export const createScoutSchema = z.object({
    ci: z.number({ 
        required_error: "El CI es necesario",
        invalid_type_error: "El CI debe ser un número entero positivo "
     }).int().positive(),
    primer_nombre: z.string({ 
        required_error: "El primer nombre es requerido",
        invalid_type_error: "El primer nombre debe ser un texto"
     }).min(1),
    segundo_nombre: z.string().optional(),
    primer_apellido: z.string({ 
        required_error: "El primer apellido es requerido",
        invalid_type_error: "El primer apellido debe ser un texto"
     }).min(1),
    segundo_apellido: z.string().optional(),
    fecha_nacimiento: z.string({
        required_error: "La fecha de nacimiento es requerida"
    }).regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
    sexo: z.enum(['M', 'F'], {
        required_error: "El sexo es requerido"
    }),
    grupo: z.string({ 
        required_error: "El grupo es requerido",
        invalid_type_error: "El grupo debe ser un texto"
     }).min(1),
    rama: z.string({ 
        required_error: "La rama es requerida",
         invalid_type_error: "La rama debe ser un texto"
     }).min(1),
    unidad: z.string({ 
        required_error: "La unidad es requerida",
         invalid_type_error:"La unidad debe ser un texto"
     }).min(1),
    etapa: z.string({ 
        required_error: "La etapa es requerida",
         invalid_type_error:"La etapa debe ser un texto"
    }).min(1),
    curso: z.string().optional(),
    numero_deposito: z.string().optional(),
    monto: z.number().nonnegative().optional(),
    es_beca: z.boolean().default(false),
    tipo_beca: z.string().optional(),
    contacto_emergencia_nombre_parentesco: z.string().optional(),
    contacto_emergencia_celular: z.string().optional(),
    envio: z.string().optional(),
});

export const updateScoutSchema = z.object({
    ci: z.number({ 
        required_error: "El CI es necesario",
        invalid_type_error: "El CI debe ser un número entero positivo "
     }).int().positive().optional(),
    primer_nombre: z.string().min(1).optional(),
    segundo_nombre: z.string().optional(),
    primer_apellido: z.string().min(1).optional(),
    segundo_apellido: z.string().optional(),
    fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sexo: z.enum(['M', 'F']).optional(),
    grupo: z.string().min(1).optional(),
    rama: z.string().min(1).optional(),
    unidad: z.string().min(1).optional(),
    etapa: z.string().min(1).optional(),
    curso: z.string().optional(),
    numero_deposito: z.string().optional(),
    monto: z.number().nonnegative().optional(),
    es_beca: z.boolean().optional(),
    tipo_beca: z.string().optional(),
    contacto_emergencia_nombre_parentesco: z.string().optional(),
    contacto_emergencia_celular: z.string().optional(),
    envio: z.string().optional(),
});