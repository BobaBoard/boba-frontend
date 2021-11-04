import boards from "./boards";
import { setupServer } from "msw/node";
import { setupWorker } from "msw";

if (typeof window !== "undefined") {
  const worker = setupWorker(...boards);
  worker.start();
} else {
  const server = setupServer(...boards);
  server.listen();
}
export default {};
