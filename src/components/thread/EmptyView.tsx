import {
  GALLERY_VIEW_SUB_MODE,
  THREAD_VIEW_MODE,
  TIMELINE_VIEW_SUB_MODE,
  useThreadViewContext,
} from "contexts/ThreadViewContext";

import React from "react";
import { useAuth } from "components/Auth";

const EmptyGalleryView = () => {
  const { galleryViewMode, timelineViewMode, currentThreadViewMode } =
    useThreadViewContext();
  const { isLoggedIn } = useAuth();
  const isNewMode =
    (currentThreadViewMode === THREAD_VIEW_MODE.MASONRY &&
      galleryViewMode.mode === GALLERY_VIEW_SUB_MODE.NEW) ||
    (currentThreadViewMode === THREAD_VIEW_MODE.TIMELINE &&
      timelineViewMode === TIMELINE_VIEW_SUB_MODE.NEW);
  const emptyMessage = !isNewMode
    ? "The gallery is empty :("
    : isLoggedIn
    ? "No new (or updated) posts!"
    : "This view mode is only available for logged in users.";
  const imageSrc =
    isNewMode && !isLoggedIn ? "/come_back.png" : "/empty_gallery.gif";
  return (
    <div>
      <div className="image">
        <img src={imageSrc} />
      </div>
      <div className="empty">{emptyMessage}</div>
      <style jsx>{`
        .image {
          text-align: center;
        }
        .image img {
          max-width: min(90%, 400px);
        }
        .empty {
          color: white;
          text-align: center;
          margin-top: 10px;
          font-size: normal;
        }
        a {
          display: block;
          color: white;
          text-align: center;
          font-size: small;
          margin-top: 10px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default EmptyGalleryView;
