import { knex as setupKnex, Knex } from 'knex'
import { env } from './env/handle-env-variables'

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/',
  },
}

export const knex = setupKnex(config)
