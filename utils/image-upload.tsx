import React from "react";
import firebase from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import noop from "noop-ts";

import { getPageDetails } from "./router-utils";
import { NextRouter } from "next/router";
import loadImage from "blueimp-load-image";
import debug from "debug";
const error = debug("bobafrontend:postEditor-error");

const uploadImage = ({
  baseUrl,
  extension,
  imageData,
}: {
  baseUrl: string;
  extension: string;
  imageData: string;
}): Promise<string> => {
  const ref = firebase.storage().ref(baseUrl).child(`${uuidv4()}${extension}`);

  return new Promise((onSuccess, onReject) => {
    ref
      .putString(imageData, "data_url")
      .on(firebase.storage.TaskEvent.STATE_CHANGED, {
        complete: () => {
          ref.getDownloadURL().then((url) => onSuccess(url));
        },
        next: noop,
        error: (e) => {
          error(e);
          onReject(e);
        },
      });
  });
};

const applyAndStripExif = async (imageData: string) => {
  const imageWithRotation = await loadImage(imageData, {
    orientation: true,
    canvas: true,
  });
  return (imageWithRotation.image as any as HTMLCanvasElement).toDataURL();
};

const STRIP_EXIF_EXTENSIONS = ["jpeg", "jpg", "tiff"];
const createImageUploadPromise = async ({
  imageData,
  slug,
  threadId,
}: {
  imageData: string;
  slug: string | null;
  threadId: string | null;
}) => {
  // Do not upload tenor stuff
  if (imageData.startsWith("https://media.tenor.com/")) {
    return imageData;
  }
  const baseUrl = `images/${slug}/${threadId ? threadId + "/" : ""}`;
  // Upload base 64 images
  if (imageData.startsWith("data:image")) {
    let dataType = imageData.match(/[^:/]\w+(?=;|,)/)?.[0];
    let strippedData = imageData;
    if (!dataType || STRIP_EXIF_EXTENSIONS.includes(dataType.toLowerCase())) {
      strippedData = await applyAndStripExif(imageData);
      dataType = strippedData.match(/[^:/]\w+(?=;|,)/)?.[0];
    }
    const extension = dataType ? `.${dataType}` : "";

    return await uploadImage({
      baseUrl,
      extension,
      imageData: strippedData,
    });
  }
  // else, for now, let's just swap it with the Onceler.
  return "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2Fe7533caf-c4e4-42c5-a668-21236995156a.jpeg?alt=media&token=c9804eb5-f72e-46a2-8854-0a7b154a7ecd";
};

export const useImageUploader = (router: NextRouter) => {
  const { slug, threadId } = getPageDetails(router);
  return React.useMemo(
    () => ({
      onImageUploadRequest: (src: string) =>
        createImageUploadPromise({
          imageData: src,
          slug,
          threadId,
        }),
    }),
    [slug, threadId]
  );
};
