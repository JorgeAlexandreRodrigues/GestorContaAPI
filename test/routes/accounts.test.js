const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';

let user;
let user2;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', email: `${Date.now()}@mail.com`, password: '123456' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
  const res2 = await app.services.user.save({ name: 'User Account #2', email: `${Date.now()}@mail.com`, password: '123456' });
  user2 = { ...res2[0] };
});

// beforeEach(async () => {
//   await app.db('transactions').del();
//   await app.db('accounts').del();
// });

test('Deve inserir uma conta com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Acc #1' })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Acc #1');
    });
});
test('Não deve inserir uma conta sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({})
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});

test('Não deve inserir uma conta de nome duplicado, para o mesmo usuário', () => {
  return app.db('accounts').insert({ name: 'Acc duplicada', user_id: user.id })
    .then(() => request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'Acc duplicada' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Já exite uma conta com esse nome');
    });
});

// Aula 35
// test('Deve listar todas as contas', () => {
//   return app.db('accounts').insert({ name: 'Acc list', user_id: user.id })
//     .then(() => request(app).get(MAIN_ROUTE)
//       .set('authorization', `bearer ${user.token}`))
//     .then((res) => {
//       expect(res.status).toBe(200);
//       expect(res.body.length).toBeGreaterThan(0);
//     });
// });

// Aula 50 criar user2 para poder testar
test('Deve listar as contas do usuário', async () => {
  await app.db('transactions').del();
  await app.db('transfers').del();
  await app.db('accounts').del();
  return app.db('accounts').insert([
    { name: 'Acc User #1', user_id: user.id },
    { name: 'Acc User #2', user_id: user2.id },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Acc User #1');
    });
});

// Aula 36 este teste insere 1 conta no bd e a seguir vai buscar pelo id
test('Deve retornar uma conta por Id', () => {
  return app.db('accounts')
    .insert({ name: 'Acc By Id', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc By Id');
      expect(res.body.user_id).toBe(user.id);
    });
});
test('Não deve retornar de um outro usuário', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Este recurso nao pertence ao usuário');
    });
});

// Aula 37
test('Deve alterar uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc to Update', user_id: user.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: 'Acc Update' })
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc Update');
    });
});

test('Não deve alterar uma conta de outro usuário', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: 'Acc Update' })
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Este recurso nao pertence ao usuário');
    });
});

// Aula 38
test('Deve remover uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc By Id', user_id: user.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Não deve remover uma conta de outro usuário', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Este recurso nao pertence ao usuário');
    });
});
