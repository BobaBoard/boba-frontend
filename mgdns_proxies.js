const mdns = require("multicast-dns")();

const TO_REGISTER = ["v0_boba.local", "v1_boba.local"];

// mdns.on("response", function (response) {
//   if (response.answers.some((q) => q.name.indexOf("boba.local") != -1)) {
//     console.log("got a response packet:", response);
//   }
// });

// mdns.on("query", function (query) {
//   console.log(query.questions.map((q) => `${q.name} ${q.type}`));
//   if (query.questions.some((q) => q.name.indexOf("boba.local") != -1)) {
//     console.log("got a query packet:", query.questions);
//   }
// });

const registerDomains = () => {
  mdns.respond({
    answers: TO_REGISTER.map((domain) => ({
      name: domain,
      type: "A",
      ttl: 30,
      data: "127.0.0.1",
    })),
  });
};

setTimeout(function timing() {
  console.log("refreshing DNS entries");
  registerDomains();
  setTimeout(timing, 25 * 1000);
}, 25 * 1000);
registerDomains();
