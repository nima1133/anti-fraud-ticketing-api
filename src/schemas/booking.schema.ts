import {z} from "zod"

 export const reserveTicketInput = z.object({
  quantity: z.number().int().positive(),
});
 export const paramsInput = z.object({
  eventId: z.coerce.number().int().positive(),
});