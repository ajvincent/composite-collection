import CompositeDriver from "composite-collection/Driver";
import path from "path";

const driver = new CompositeDriver(
  path.join(process.cwd(), "configurations"),
  path.join(process.cwd(), "collections")
);
await driver.run();

const WeakFunctionMultiMap = (await import(new URL("collections/WeakFunctionMultiMap.mjs", import.meta.url))).default;

const wfMM = new WeakFunctionMultiMap();
const key1 = {}, callback1 = function() {}, callback2 = function() {};
wfMM.add(key1, callback1);
wfMM.add(key1, callback2);

console.log("Success");
