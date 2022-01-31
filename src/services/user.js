const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select(['id', 'name', 'email']);// quando vai bd so vai buscar isto para proteger a pass
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const getPasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
    if (!user.email) throw new ValidationError('Email é um atributo obrigatório');
    if (!user.password) throw new ValidationError('Senha e um atributo obrigatorio');

    const userDb = await findOne({ email: user.email });
    if (userDb) throw new ValidationError('Ja existe um user com este email');

    const newUser = { ...user };
    newUser.password = getPasswordHash(user.password);

    return app.db('users').insert(newUser, ['id', 'name', 'email']); // quando vai bd so vai buscar isto para proteger a pass
  };

  return { findAll, save, findOne };
};
