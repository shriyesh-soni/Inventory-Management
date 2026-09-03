import { z } from 'zod';

export const assignLocationSchema = z.object({
  locationId: z.string().min(1, 'locationId is required'),
});

export type AssignLocationInput = z.infer<typeof assignLocationSchema>;
