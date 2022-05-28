it("Map.forEach() reference test for exceptions", () => {
  const exn = {}, value0 = "zero", value1 = "one", value2 = "two";
  const m = new Map([
    [0, value0],
    [1, value1],
    [2, value2],
  ]);

  const spy0 = jasmine.createSpy();
  const spy1 = jasmine.createSpy();
  spy1.and.callFake((value, key) => {
    void(value);
    if (key === 1)
      throw exn;
  });

  expect(() => {
    m.forEach((value, key) => {
      spy0(value, key);
      spy1(value, key);
    })
  }).toThrow(exn);

  expect(spy0).toHaveBeenCalledTimes(2);
  expect(spy0).toHaveBeenCalledWith(value0, 0);
  expect(spy0).toHaveBeenCalledWith(value1, 1);

  expect(spy1).toHaveBeenCalledTimes(2);
  expect(spy1).toHaveBeenCalledWith(value0, 0);
  expect(spy1).toHaveBeenCalledWith(value1, 1);
});
