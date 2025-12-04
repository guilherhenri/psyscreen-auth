import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3001),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_SCHEMA: z.string().optional().default('public'),
})

export type Env = z.infer<typeof envSchema>
