import handlers from "./generated";
import { setupServer } from "msw/node";
import { setupWorker } from "msw";

if (typeof window !== "undefined") {
  const worker = setupWorker(...handlers);
  worker.start();
} else {
  const server = setupServer(...handlers);
  server.listen();
}
export default {};
