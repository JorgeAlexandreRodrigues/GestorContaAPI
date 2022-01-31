const request = require('supertest');
const app = require('../../src/app');

test('Deve criar user via signUp', () => {
  const email = `${Date.now()}@mail.com`;
  return request(app).post('/auth/signup')
    .send({ name: 'Sara', email, password: '123456' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Sara');
      expect(res.body).toHaveProperty('email');
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Deve receber token ao logar', () => {
  const email = `${Date.now()}@mail.com`;
  return app.services.user.save(
    { name: 'Sara', email, password: '123456' },
  ).then(() => request(app).post('/auth/signin')
    .send({ email, password: '123456' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

test('Não deve autenticar user com senha errada', () => {
  const email = `${Date.now()}@mail.com`;
  return app.services.user.save(
    { name: 'Sara', email, password: '123456' },
  ).then(() => request(app).post('/auth/signin')
    .send({ email, password: '654321' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User ou Password inválida');
    });
});

test('Não deve autenticar user que não existe', () => {
  return request(app).post('/auth/signin')
    .send({ email: 'nãoxiste@mail.pt', password: '654321' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User ou Password inválida');
    });
});
// Aula 46 401 erro sem autenticação
test('Não aceder rota protegida sem token', () => {
  return request(app).get('/v1/users')
    .then((res) => {
      expect(res.status).toBe(401);
    });
});
