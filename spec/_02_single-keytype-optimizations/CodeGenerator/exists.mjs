import describeForAllThree from "../support/CodeGenerator.mjs";

describeForAllThree("Modules exist", modules => {
  const {
    OptimizedStrongMapOfStrongSets,
    OptimizedWeakMapOfOptimizedWeakSets,
    OptimizedWeakMapOfWeakSets,
    WeakMapOfOptimizedStrongSets,
    OptimizedStrongMapOfOptimizedStrongSets,
    OptimizedWeakMapOfOptimizedStrongSets,
    OptimizedWeakMapOfStrongSets,
    StrongMapOfOptimizedStrongSets,
    WeakMapOfOptimizedWeakSets,
  } = modules;

  it("OptimizedStrongMapOfStrongSets", () => {
    expect(typeof OptimizedStrongMapOfStrongSets).toBe("function");
  });
  it("OptimizedWeakMapOfOptimizedWeakSets", () => {
    expect(typeof OptimizedWeakMapOfOptimizedWeakSets).toBe("function");
  });
  it("OptimizedWeakMapOfWeakSets", () => {
    expect(typeof OptimizedWeakMapOfWeakSets).toBe("function");
  });
  it("WeakMapOfOptimizedStrongSets", () => {
    expect(typeof WeakMapOfOptimizedStrongSets).toBe("function");
  });
  it("OptimizedStrongMapOfOptimizedStrongSets", () => {
    expect(typeof OptimizedStrongMapOfOptimizedStrongSets).toBe("function");
  });
  it("OptimizedWeakMapOfOptimizedStrongSets", () => {
    expect(typeof OptimizedWeakMapOfOptimizedStrongSets).toBe("function");
  });
  it("OptimizedWeakMapOfStrongSets", () => {
    expect(typeof OptimizedWeakMapOfStrongSets).toBe("function");
  });
  it("StrongMapOfOptimizedStrongSets", () => {
    expect(typeof StrongMapOfOptimizedStrongSets).toBe("function");
  });
  it("WeakMapOfOptimizedWeakSets", () => {
    expect(typeof WeakMapOfOptimizedWeakSets).toBe("function");
  });
});
