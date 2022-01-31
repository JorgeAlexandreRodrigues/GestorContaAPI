test('Devo conhecer o jest', () => {
  let number = null;
  expect(number).toBeNull();
  number = 10;
  expect(number).not.toBeNull();
  expect(number).toEqual(10);
  expect(number).toBeGreaterThan(9);
  expect(number).toBeLessThan(11);
});

test('Deve conhecer trabalhar Objectos', () => {
  const obj = { name: 'Jorge', mail: 'jorge@mail.com' };
  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('name', 'Jorge');
  expect(obj.name).toBe('Jorge');
});
