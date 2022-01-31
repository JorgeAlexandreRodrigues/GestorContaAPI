module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'postgres',
      database: 'udemyteste',
    },
    debug: false,
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds' },
  },
  prod: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'postgres',
      database: 'gestorconta',
    },
    debug: false,
    migrations: { directory: 'src/migrations' },
  },
};
