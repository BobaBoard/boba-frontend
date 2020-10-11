import firebase from "firebase/app";
import { v4 as uuidv4 } from "uuid";

import debug from "debug";
const error = debug("bobafrontend:postEditor-error");

export const createImageUploadPromise = ({
  imageData,
  baseUrl,
}: {
  imageData: string;
  baseUrl: string;
}) => {
  return new Promise<string>((onSuccess, onReject) => {
    // Do not upload tenor stuff
    if (imageData.startsWith("https://media.tenor.com/")) {
      onSuccess(imageData);
      return;
    }
    // Upload base 64 images
    if (imageData.startsWith("data:image")) {
      const ref = firebase.storage().ref(baseUrl).child(uuidv4());

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
      "https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"
    );
  });
};
