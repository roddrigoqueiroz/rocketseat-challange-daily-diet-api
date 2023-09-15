import { UUID } from 'crypto'
// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  interface Tables {
    meal: {
      id: UUID
      name: string
      description?: string
      date: Date
      inDiet: boolean
      session_id: UUID
    }
  }
}

export interface Params {
  id: UUID
}
