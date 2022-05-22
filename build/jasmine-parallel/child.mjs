import {
  buildJasmine,
  ReplayOnceReporter,
  Deferred,
} from "./reporters.mjs";

class ChildReporter extends ReplayOnceReporter {
  replay() {
    const events = this.getEventLog();
    process.send({
      type: "ChildReporter:events",
      events
    });
  }
}

const jasmineDeferred = new Deferred;
const processExit = new Deferred;

process.on("message", async m => {
  if (m.type == "startJob") {
    jasmineDeferred.resolve(m.specs);
  }
  else if (m.type == "close") {
    process.exit(0);
  }
});

const specs = await jasmineDeferred.promise;
const reporter = new ChildReporter;
const jasmine = buildJasmine(reporter, specs);

await jasmine.execute();
reporter.replay();
await processExit.promise;
