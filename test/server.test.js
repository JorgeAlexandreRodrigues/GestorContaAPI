const supertest = require('supertest');

const request = supertest('http://localhost:3001');

test.skip('Deve responder na porta 3001', () => {
  // aceder a url http://localhost:3001
  return request.get('/')
    .then((res) => expect(res.status).toBe(200));
});
