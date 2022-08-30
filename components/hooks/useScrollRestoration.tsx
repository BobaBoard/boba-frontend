import { NextRouter } from "next/router";
import React from "react";

let toRestore: { x: number; y: number } | null = null;
// let previousCache: { x: number; y: number } | null = null;
// export const useScrollRestoration = (router: NextRouter) => {
//   React.useEffect(() => {
//     const saveScrollPosition = (nextRoute: string) => {
//       console.log("routeChangeStart triggered to ", nextRoute);
//       console.log(window.history.state);
//       if (window.history.state["cachedScrollPosition"]) {
//         console.log(
//           "skipping saveScrollPosition - already saved as ",
//           window.history.state.cachedScrollPosition
//         );
//         previousCache = window.history.state.cachedScrollPosition;
//         console.log("saved previousCache", previousCache);
//         return;
//       }
//       if (window.history.state.as === nextRoute && previousCache) {
//         //   console.log("skipping saveScrollPosition - reload");
//         //   console.log(window.location);
//         //   return;
//         window.history.replaceState(
//           {
//             ...window.history.state,
//             cachedScrollPosition: previousCache,
//           },
//           ""
//         );
//         console.log("saved ScrollPosition to previousCache ", previousCache);
//         return;
//       }
//       window.history.replaceState(
//         {
//           ...window.history.state,
//           cachedScrollPosition: { x: window.scrollX, y: window.scrollY },
//         },
//         ""
//       );
//       console.log(
//         "saved ScrollPosition as ",
//         window.history.state.cachedScrollPosition
//       );
//       console.log("for as ", window.history.state.as);
//       previousCache = null;
//       console.log("cleared previousCache");
//     };

//     const maybeRestoreScrollPosition = () => {
//       console.log("routeChangeComplete triggered", window.history);
//       // if (toRestore && router.isReady) {
//       //   const { x, y } = toRestore;
//       if (window.history.state["cachedScrollPosition"]) {
//         previousCache = window.history.state["cachedScrollPosition"];
//         const { x, y } = window.history.state["cachedScrollPosition"];
//         console.log("inside maybeRestoreScrollPosition", window.history);
//         window.scrollTo(x, y);
//         console.log("scroll restored to", y);
//         console.log("on page", window.location);
//         console.log("previousCache saved as", previousCache);
//         toRestore = null;
//         console.log("cleared toRestore");
//       } else {
//         console.log("didn't restore scroll");
//       }
//     };

//     const scheduleRestore = () => {
//       console.log("beforeHistoryChange triggered", window.history);
//       if (window.history.state["cachedScrollPosition"]) {
//         toRestore = window.history.state["cachedScrollPosition"];
//         console.log("restore scheduled", toRestore);
//       } else {
//         console.log("restore not scheduled");
//       }
//       console.log("scheduleRestore complete");
//       return true;
//     };

//     console.log(window.history);
//     console.log(window.history.state.as);
//     if ("scrollRestoration" in window.history) {
//       router.events.on("routeChangeStart", saveScrollPosition);
//       router.events.on("routeChangeComplete", maybeRestoreScrollPosition);
//       router.events.on("beforeHistoryChange", scheduleRestore);
//       return () => {
//         router.events.off("routeChangeStart", saveScrollPosition);
//         router.events.off("routeChangeComplete", maybeRestoreScrollPosition);
//         router.events.off("beforeHistoryChange", scheduleRestore);
//       };
//     }
//     return;
//   }, [router.events]);
// };
// export const useScrollRestoration = (router: NextRouter) => {
//   React.useEffect(() => {
//     const saveScrollPosition = (nextRoute: string) => {
//       console.log("routeChangeStart triggered to ", nextRoute);
//       console.log(window.history.state);
//       window.history.replaceState(
//         {
//           ...window.history.state,
//           cachedScrollPosition: { x: window.scrollX, y: window.scrollY },
//         },
//         ""
//       );
//       console.log(
//         "saved ScrollPosition as ",
//         window.history.state.cachedScrollPosition
//       );
//       console.log("for as ", window.history.state.as);
//     };

//     const maybeRestoreScrollPosition = () => {
//       console.log("routeChangeComplete triggered", window.history);
//       // if (toRestore && router.isReady) {
//       //   const { x, y } = toRestore;
//       if (window.history.state["cachedScrollPosition"]) {
//         const { x, y } = window.history.state["cachedScrollPosition"];
//         console.log("inside maybeRestoreScrollPosition", window.history);
//         window.scrollTo(x, y);
//         console.log("scroll restored to", y);
//         console.log("on page", window.location);
//       } else {
//         console.log(
//           "didn't restore scroll",
//           window.history.state["cachedScrollPosition"]
//         );
//       }
//     };

//     // const scheduleRestore = () => {
//     //   console.log("beforeHistoryChange triggered", window.history);
//     //   if (window.history.state["cachedScrollPosition"]) {
//     //     toRestore = window.history.state["cachedScrollPosition"];
//     //     console.log("restore scheduled", toRestore);
//     //   } else {
//     //     console.log("restore not scheduled");
//     //   }
//     //   console.log("scheduleRestore complete");
//     //   return true;
//     // };

//     console.log(window.history);
//     console.log(window.history.state.as);
//     if ("scrollRestoration" in window.history) {
//       router.events.on("routeChangeStart", saveScrollPosition);
//       router.events.on("routeChangeComplete", maybeRestoreScrollPosition);
//       // router.events.on("beforeHistoryChange", scheduleRestore);
//       return () => {
//         router.events.off("routeChangeStart", saveScrollPosition);
//         router.events.off("routeChangeComplete", maybeRestoreScrollPosition);
//         // router.events.off("beforeHistoryChange", scheduleRestore);
//       };
//     }
//     return;
//   }, [router.events]);
// };
export const useScrollRestoration = (router: NextRouter) => {
  React.useEffect(() => {
    const saveScrollPosition = (nextRoute: string) => {
      console.log("routeChangeStart triggered to ", nextRoute);
      console.log(window.history.state);
      if (!toRestore && window.history.state.cachedScrollPosition) {
        toRestore = window.history.state.cachedScrollPosition;
        console.log("toRestore set to", toRestore);
      }
      console.log("for as ", window.history.state.as);
      if (window.history.state.as !== nextRoute) {
        toRestore = null;
        console.log("toRestore cleared", toRestore);
        window.history.replaceState(
          {
            ...window.history.state,
            cachedScrollPosition: { x: window.scrollX, y: window.scrollY },
          },
          ""
        );
        console.log(
          "saved ScrollPosition as ",
          window.history.state.cachedScrollPosition
        );
      }
    };

    const maybeRestoreScrollPosition = () => {
      console.log("routeChangeComplete triggered", window.history);
      if (toRestore) {
        const { x, y } = toRestore;
        // if (window.history.state["cachedScrollPosition"]) {
        //   const { x, y } = window.history.state["cachedScrollPosition"];
        window.scrollTo(x, y);
        console.log("scroll restored to", toRestore);
        console.log("on page", window.location);
      } else {
        console.log("didn't restore scroll, toRestore", toRestore);
        console.log(
          "didn't restore scroll, cachedScrollPosition",
          window.history.state["cachedScrollPosition"]
        );
      }
    };

    // const scheduleRestore = () => {
    //   console.log("beforeHistoryChange triggered", window.history);
    //   if (window.history.state["cachedScrollPosition"]) {
    //     toRestore = window.history.state["cachedScrollPosition"];
    //     console.log("restore scheduled", toRestore);
    //   } else {
    //     console.log("restore not scheduled");
    //   }
    //   console.log("scheduleRestore complete");
    //   return true;
    // };

    console.log(window.history);
    console.log(window.history.state.as);
    if ("scrollRestoration" in window.history) {
      router.events.on("routeChangeStart", saveScrollPosition);
      router.events.on("routeChangeComplete", maybeRestoreScrollPosition);
      // router.events.on("beforeHistoryChange", scheduleRestore);
      return () => {
        router.events.off("routeChangeStart", saveScrollPosition);
        router.events.off("routeChangeComplete", maybeRestoreScrollPosition);
        // router.events.off("beforeHistoryChange", scheduleRestore);
      };
    }
    return;
  }, [router.events]);
};
