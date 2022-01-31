const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const email = `${Date.now()}@mail.com`;

const MAIN_ROUTE = '/v1/users';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'Jorge Rodrigues', email: `${Date.now()}@ipca.pt`, password: '12345' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

test('Deve listar todos os utilizadores', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve inserir utilizador com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Sara', email, password: '123456' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Sara');
      expect(res.body).not.toHaveProperty('password');
    });
});
// Aula 43
test('Deve armazenar senha criptografada', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Sara', email: `${Date.now()}@mail.com`, password: '123456' })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDb = await app.services.user.findOne({ id });
  expect(userDb.password).not.toBeUndefined();
  expect(userDb.password).not.toBe('123456');
});

// como nao vai à base dados podemos atribuir qualquer email
// o que se pretende é o erro por falta do nome
test('Não deve inserir usuário sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ email: 'sara@mail.pt', password: '123456' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});
// se, o return, recebe o objecto no result e resolve no serviço com
// if(!user.email) return error | escusa de ir resolver a rota
test('Não deve inserir user sem email', async () => {
  const result = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Sara', password: '123456' })
    .set('authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatório');
});

test('Não deve inserir user sem senha', (done) => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Sara', email: 'sara@mail.pt' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Senha e um atributo obrigatorio');
      done();
    });
});
// Aula 32
test('Não deve inserir user com email existente', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Sara', email, password: '123456' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Ja existe um user com este email');
    });
});
