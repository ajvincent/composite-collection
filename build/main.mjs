import main from "./targets.mjs";
import BuildPromise from './BuildPromise.mjs';

const targets = process.argv.slice(2);
targets.forEach(t => main.addSubtarget(t));
await main.run();
BuildPromise.markClosed();
