exports.up = (knex) => {
  return knex.schema.createTable('accounts', (t) => {
    t.increments('id').primary();
    t.string('name').notNull();
    t.integer('user_id')
      .references('id')
      .inTable('users')
      .notNull();
  });
};
// Aula 33 explica o roolback e o latest
exports.down = (knex) => {
  return knex.schema.dropTable('accounts');
};
