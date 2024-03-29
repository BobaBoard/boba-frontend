import debug from "debug";
const log = debug("bobafrontend:utils:embeds-cache");

const CACHE = new Map<string, HTMLElement | undefined>();
const TIMESTAMPS = new Map<string, number>();
const embedsCache = new Proxy(CACHE, {
  get: (target, prop, receiver) => {
    let value;
    if (prop === "get") {
      value = (property: string) => {
        TIMESTAMPS.set(property, Date.now());
        const element = CACHE.get(property);
        element?.classList.add("from-cache");
        return element;
      };
    } else if (prop === "set") {
      value = (property: string, value: HTMLElement) => {
        TIMESTAMPS.set(property, Date.now());
        return CACHE.set(property, value);
      };
    } else if (prop === "clear") {
      TIMESTAMPS.clear();
      CACHE.clear();
    } else {
      // This covers the "has" case
      value = Reflect.get(target, prop, receiver);
    }
    return typeof value === "function" ? value.bind(target) : value;
  },
});

// 10 minutes
const TIMEOUT = 10 * 60 * 1000;
const SIZE_LIMIT = 50;
setTimeout(function clearCache() {
  const toClear: string[] = [];
  if (TIMESTAMPS.size > SIZE_LIMIT) {
    TIMESTAMPS.forEach((timestamp, key) => {
      // Make sure that the node is not attached to the dom when clearing
      // it out.
      if (timestamp - Date.now() > TIMEOUT && !CACHE.get(key)?.parentElement) {
        toClear.push(key);
      }
    });
  }
  toClear.forEach((value) => {
    TIMESTAMPS.delete(value);
    CACHE.delete(value);
    log(`cleared ${value}`);
  });
  setTimeout(clearCache, TIMEOUT);
}, TIMEOUT);

export default embedsCache as unknown as Map<string, HTMLElement | undefined>;
