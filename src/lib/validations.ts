import * as z from 'zod';

export const stopSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Apelido é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  lat: z.number(),
  lng: z.number(),
  windowStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)').optional(),
  windowEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)').optional(),
});

export const stopsFormSchema = z.object({
  addressInput: z.string().min(1, 'Endereço é obrigatório'),
  cep: z.string().regex(/^[0-9]{8}$/, 'CEP inválido'),
  number: z.string().min(1, 'Número é obrigatório'),
  label: z.string().min(1, 'Apelido é obrigatório'),
  windowStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)'),
  windowEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)'),
  customerName: z.string().min(1, 'Nome do cliente é obrigatório'),
  customerPhone: z.string().regex(/^[0-9]{10,11}$/, 'Telefone inválido'),
  orderDetails: z.string().optional(),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.enum(['DINHEIRO', 'CARTÃO', 'PIX', 'PAGO']),
  needChange: z.boolean().optional(),
  changeAmount: z.string().regex(/^[0-9]+([,.][0-9]{1,2})?$/, 'Valor inválido').optional(),
});

export type StopsFormData = z.infer<typeof stopsFormSchema>;

export const planSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  createdAt: z.string(),
  city: z.string(),
  origin: stopSchema,
  returnToStart: z.boolean(),
  stops: z.array(stopSchema).min(2, 'Mínimo de 2 paradas').max(50, 'Máximo de 50 paradas'),
  totalDistanceMeters: z.number(),
  totalDurationSec: z.number(),
  version: z.number(),
});