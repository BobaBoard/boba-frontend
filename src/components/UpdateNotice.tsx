import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { toast } from "@bobaboard/ui-components";

import debug from "debug";
const log = debug("bobafrontend:UpdateNotice-log");
const info = debug("bobafrontend:UpdateNotice-info");

const updateAxios = axios.create();
export const UpdateNotice = () => {
  const { data } = useQuery<{ buildId: string }>(
    "NEXTJS_BUILD_ID",
    async () => {
      return (await updateAxios.get("/api/build-id")).data;
    },
    {
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
      notifyOnChangeProps: ["data"],
      initialData: { buildId: process.env.BUILD_ID! },
    }
  );

  info(`Current build id: ${process.env.BUILD_ID}`);
  if (data?.buildId !== process.env.BUILD_ID) {
    log(
      `Mismatched build id: ${process.env.BUILD_ID} (current) vs ${data?.buildId} (server).`
    );
    toast.error(
      <div style={{ textAlign: "center" }}>
        <strong>Outdated version detected!</strong>
        <br />
        Click to refresh.
      </div>,
      {
        toastId: "BUILD_MISMATCH_ERROR",
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        onClick: () => {
          window.location.reload();
        },
      }
    );
  }

  // This component is not used for rendering, but we can't currently use a hook
  // cause there's no global Component wrapped within a QueryProvider to put it in.
  // TODO: That would be a nice thing to have a some point.
  return null;
};
