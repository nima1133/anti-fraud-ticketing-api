import {z} from "zod"

 export const reserveTicketInput = z.object({
  quantity: z.number().int().positive(),
  idempotencyKey : z.string()
});
 export const paramsInput = z.object({
  eventId: z.coerce.number().int().positive(),
});