import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') config({ path: '.env.test' })
else config()

const envVariables = z.object({
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

const verifyEnvVariables = envVariables.safeParse(process.env)

if (!verifyEnvVariables.success) {
  console.error('Wrong env variables!')

  throw verifyEnvVariables.error
}

export const env = verifyEnvVariables.data
