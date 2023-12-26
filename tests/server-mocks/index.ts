import boardHandlers from "./boards";
import debug from "debug";
import feedHandlers from "./feeds";
import postsHandlers from "./posts";
import realmHandlers from "./realms";
import { setupServer } from "msw/node";
import threadHandlers from "./threads";
import usersHandlers from "./users";

const log = debug("bobafrontend:tests:server-mocks");

// let worker: SetupWorkerApi;
// let server: SetupServerApi;
// if (typeof window !== "undefined" && process.env.JEST_WORKER_ID === undefined) {
//
//   worker.start();
// } else {
//   const server = setupServer(...handlers);
//   server.listen();
// }
// export default { worker, server };
export const server = setupServer(
  ...boardHandlers,
  ...usersHandlers,
  ...realmHandlers,
  ...feedHandlers,
  ...threadHandlers,
  ...postsHandlers
);

server.events.on("request:start", async ({ request: req }) => {
  // console.log(
  //   "new request:",
  //   req.method,
  //   req.url,
  //   req.body && (await req.clone().json())
  // );
});
server.events.on("response:mocked", ({ request, requestId, response }) => {
  // console.log(
  //   "%s %s received %s %s",
  //   request.method,
  //   request.url,
  //   response.status,
  //   response.statusText
  // );
});
