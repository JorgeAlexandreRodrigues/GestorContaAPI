module.exports = function RecursoIndevidoError(message = 'Este recurso nao pertence ao usuário') {
  this.name = 'RecursoIndevidoError';
  this.message = message;
};
