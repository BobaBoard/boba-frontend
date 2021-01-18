import firebase from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import { NextRouter } from "next/router";

import debug from "debug";
import { getPageDetails } from "./router-utils";
const error = debug("bobafrontend:postEditor-error");

export const createImageUploadPromise = ({
  imageData,
  router,
}: {
  imageData: string;
  router: NextRouter;
}) => {
  return new Promise<string>((onSuccess, onReject) => {
    // Do not upload tenor stuff
    if (imageData.startsWith("https://media.tenor.com/")) {
      onSuccess(imageData);
      return;
    }
    const { slug, threadId } = getPageDetails(router);
    const baseUrl = `images/${slug}/${threadId ? threadId + "/" : ""}`;
    // Upload base 64 images
    if (imageData.startsWith("data:image")) {
      const dataType = imageData.match(/[^:/]\w+(?=;|,)/)?.[0];
      const extension = dataType ? `.${dataType}` : "";
      const ref = firebase
        .storage()
        .ref(baseUrl)
        .child(`${uuidv4()}${extension}`);

      ref
        .putString(imageData, "data_url")
        .on(firebase.storage.TaskEvent.STATE_CHANGED, {
          complete: () => {
            ref.getDownloadURL().then((url) => onSuccess(url));
          },
          next: () => {},
          error: (e) => {
            error(e);
            onReject(e);
          },
        });
      return;
    }
    // else, for now, let's just swap it with the Onceler.
    onSuccess(
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2Fe7533caf-c4e4-42c5-a668-21236995156a.jpeg?alt=media&token=c9804eb5-f72e-46a2-8854-0a7b154a7ecd"
    );
  });
};
