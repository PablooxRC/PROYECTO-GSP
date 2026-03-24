import { z } from "zod";

export const createScoutSchema = z.object({
  ci: z
    .string({
      required_error: "El CI es necesario",
      invalid_type_error: "El CI debe ser un texto",
    })
    .min(1),
  primer_nombre: z
    .string({
      required_error: "El primer nombre es requerido",
      invalid_type_error: "El primer nombre debe ser un texto",
    })
    .min(1),
  segundo_nombre: z.string().optional(),
  primer_apellido: z
    .string({
      required_error: "El primer apellido es requerido",
      invalid_type_error: "El primer apellido debe ser un texto",
    })
    .min(1),
  segundo_apellido: z.string().optional(),
  fecha_nacimiento: z
    .string({
      required_error: "La fecha de nacimiento es requerida",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
  sexo: z.enum(["M", "F"], {
    required_error: "El sexo es requerido",
  }),
  grupo: z
    .string({
      required_error: "El grupo es requerido",
      invalid_type_error: "El grupo debe ser un texto",
    })
    .min(1),
  rama: z
    .string({
      required_error: "La rama es requerida",
      invalid_type_error: "La rama debe ser un texto",
    })
    .min(1),
  unidad: z
    .string({
      required_error: "La unidad es requerida",
      invalid_type_error: "La unidad debe ser un texto",
    })
    .min(1),
  etapa: z
    .string({
      required_error: "La etapa es requerida",
      invalid_type_error: "La etapa debe ser un texto",
    })
    .min(1),
  colegio: z.string().optional(),
  curso: z.string().optional(),
  numero_deposito: z.string().optional(),
  monto: z.coerce.number().nonnegative().optional(),
  fecha_deposito: z.string().optional(),
  hora_deposito: z.string().optional(),
  es_beca: z.boolean().default(false),
  tipo_beca: z.string().optional(),
  contacto_emergencia_nombre_parentesco: z.string().optional(),
  contacto_emergencia_celular: z.string().optional(),
  envio: z.string().optional(),
});

export const updateScoutSchema = z.object({
  ci: z.string().min(1).optional().nullable(),
  primer_nombre: z.string().min(1).optional().nullable(),
  segundo_nombre: z.string().optional().nullable(),
  primer_apellido: z.string().min(1).optional().nullable(),
  segundo_apellido: z.string().optional().nullable(),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  sexo: z.enum(["M", "F"]).optional().nullable(),
  grupo: z.string().min(1).optional().nullable(),
  rama: z.string().min(1).optional().nullable(),
  unidad: z.string().min(1).optional().nullable(),
  etapa: z.string().min(1).optional().nullable(),
  colegio: z.string().optional().nullable(),
  curso: z.string().optional().nullable(),
  numero_deposito: z.string().optional().nullable(),
  monto: z.coerce.number().nonnegative().optional().nullable(),
  hora_deposito: z.string().optional().nullable(),
  es_beca: z.coerce.boolean().optional().nullable(),
  tipo_beca: z.string().optional().nullable(),
  contacto_emergencia_nombre_parentesco: z.string().optional().nullable(),
  contacto_emergencia_celular: z.string().optional().nullable(),
  envio: z.string().optional().nullable(),
});
