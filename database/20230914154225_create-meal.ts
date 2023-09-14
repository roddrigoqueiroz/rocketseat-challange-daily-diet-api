import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meal', (table) => {
    table.uuid('id', { primaryKey: true })
    table.string('name').notNullable()
    table.string('description')
    table.dateTime('date').notNullable()
    table.boolean('inDiet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('meal')
}
