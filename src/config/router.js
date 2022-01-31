const express = require('express');

module.exports = (app) => {
  app.use('/auth', app.routes.auth);
  const protectedRouter = express.Router();

  protectedRouter.use('/users', app.config.passport.authenticate(), app.routes.users);
  protectedRouter.use('/accounts', app.config.passport.authenticate(), app.routes.accounts);
  protectedRouter.use('/transactions', app.config.passport.authenticate(), app.routes.transactions);
  protectedRouter.use('/transfers', app.config.passport.authenticate(), app.routes.transfers);
  protectedRouter.use('/balance', app.config.passport.authenticate(), app.routes.balance);

  app.use('/v1', app.config.passport.authenticate(), protectedRouter);
};
