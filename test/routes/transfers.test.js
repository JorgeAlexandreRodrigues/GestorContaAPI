const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwiZW1haWwiOiJ1c2VyMUBtYWlsLmNvbSJ9.4FZv8ptQjvtBnO0DfLuZhaYnDgjSx6Uab2mrVfCyYm4';

beforeAll(async () => {
  await app.db.seed.run();
});
// Aula 69
test('Deve listar apenas as transferencias do usuário', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Transfer #1');
    });
});

test('Deve inserir uma transferencia com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
    .then(async (res) => {
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Regular Transfer');

      const transactions = await app.db('transactions').where({ transfer_id: res.body.id });
      expect(transactions).toHaveLength(2);
      expect(transactions[0].description).toBe('Transfer to acc #10001');
      expect(transactions[1].description).toBe('Transfer from acc #10000');
      expect(transactions[0].ammount).toBe('-100.00');
      expect(transactions[1].ammount).toBe('100.00');
      expect(transactions[0].acc_id).toBe(10000);
      expect(transactions[1].acc_id).toBe(10001);
    });
});
// Aula 71
describe('Ao salvar uma transferencia válida', () => {
  let transferId;
  let income;
  let outcome;
  test('Deve retornar o status 201 e os dados da transferencia', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
      .then(async (res) => {
        expect(res.status).toBe(201);
        expect(res.body.description).toBe('Regular Transfer');
        transferId = res.body.id;
      });
  });
  test('AS transações equivalente devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });
  test('A transação de saida deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001');
    expect(outcome.ammount).toBe('-100.00');
    expect(outcome.acc_id).toBe(10000);
    expect(outcome.type).toBe('O');
  });
  test('A transação de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000');
    expect(income.ammount).toBe('100.00');
    expect(income.acc_id).toBe(10001);
    expect(income.type).toBe('I');
  });
  test('Ambas devem referenciar a transferencia que as originou', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
});
// Aula 72
describe('Ao tentar salvar uma transferencia inválida ....', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date(), ...newData })
      .then(async (res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };
  test('Não deve inserir sem descrição', () => testTemplate({ description: null }, 'Descriçao e um atributo obrigatorio'));
  test('Não deve inserir sem valor', () => testTemplate({ ammount: null }, 'Valor e um atributo obrigatorio'));
  test('Não deve inserir sem data', () => testTemplate({ date: null }, 'Data e um atributo obrigatorio'));
  test('Não deve inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'Conta Origem e um atributo obrigatorio'));
  test('Não deve inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'Conta Destino e um atributo obrigatorio'));
  test('Não deve inserir se as contas de origem de destino forem as mesmas', () => testTemplate({ acc_dest_id: 10000 }, 'Contas Iguais e um atributo obrigatorio'));
  test('Não deve inserir se as contas pertencerem a outro usuário', () => testTemplate({ acc_ori_id: 10002 }, 'Conta #10002 não pertence ao usuário'));
});
// Aula 73
test('Deve retornar uma transferencia por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Transfer #1');
    });
});
// Aula 74
describe('Ao alterar uma transferencia válida...', () => {
  let transferId;
  let income;
  let outcome;
  test('Deve retornar o status 200 e os dados da transferencia', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: 'Transfer Update', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 500, date: new Date() })
      .then(async (res) => {
        expect(res.status).toBe(200);
        expect(res.body.description).toBe('Transfer Update');
        expect(res.body.ammount).toBe('500.00');
        transferId = res.body.id;
      });
  });

  // Aula 75
  test('As transações equivalente devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });
  test('A transação de saida deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001');
    expect(outcome.ammount).toBe('-500.00');
    expect(outcome.acc_id).toBe(10000);
    expect(outcome.type).toBe('O');
  });
  test('A transação de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000');
    expect(income.ammount).toBe('500.00');
    expect(income.acc_id).toBe(10001);
    expect(income.type).toBe('I');
  });
  test('Ambas devem referenciar a transferencia que as originou', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
  test('Ambas devem estar com o status de realizadas', () => {
    expect(income.status).toBe(true);
    expect(outcome.status).toBe(true);
  });
});
describe('Ao tentar alterar uma transferencia inválida ....', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date(), ...newData })
      .then(async (res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };
  test('Não deve inserir sem descrição', () => testTemplate({ description: null }, 'Descriçao e um atributo obrigatorio'));
  test('Não deve inserir sem valor', () => testTemplate({ ammount: null }, 'Valor e um atributo obrigatorio'));
  test('Não deve inserir sem data', () => testTemplate({ date: null }, 'Data e um atributo obrigatorio'));
  test('Não deve inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'Conta Origem e um atributo obrigatorio'));
  test('Não deve inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'Conta Destino e um atributo obrigatorio'));
  test('Não deve inserir se as contas de origem de destino forem as mesmas', () => testTemplate({ acc_dest_id: 10000 }, 'Contas Iguais e um atributo obrigatorio'));
  test('Não deve inserir se as contas pertencerem a outro usuário', () => testTemplate({ acc_ori_id: 10002 }, 'Conta #10002 não pertence ao usuário'));
});

describe('Ao remover uma transferencia', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });
  // Vai a base de dados verificar que existe algum registo 10000
  test('O registro deve ter sido removido do banco', () => {
    return app.db('transfers').where({ id: 10000 })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });
  test('As transações associadas deve ter sido removidas', () => {
    return app.db('transactions').where({ transfer_id: 10000 })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });
});

// Aula 78
test('Não deve retornar transferencia de outro usuário', () => {
  return request(app).get(`${MAIN_ROUTE}/10001`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Este recurso nao pertence ao usuário');
    });
});
