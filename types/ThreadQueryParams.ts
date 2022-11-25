import { DecodedValueMap } from "use-query-params";
import { ExistanceParam } from "../components/QueryParamNextProvider";
import { ThreadType } from "./Types";

// All the view types available for a specific thread
export enum THREAD_VIEW_MODE {
  THREAD = "THREAD",
  MASONRY = "MASONRY",
  TIMELINE = "TIMELINE",
}

// The extra subview types available in timeline mode
export enum TIMELINE_VIEW_SUB_MODE {
  NEW = "NEW",
  LATEST = "LATEST",
  ALL = "ALL",
}

// The extra subview types available in gallery mode
export enum GALLERY_VIEW_SUB_MODE {
  NEW = "NEW",
  ALL = "ALL",
}

export interface ClassicThreadViewMode {
  threadViewMode: THREAD_VIEW_MODE.THREAD;
  galleryViewMode: null;
  timelineViewMode: null;
}

export interface GalleryViewMode {
  threadViewMode: THREAD_VIEW_MODE.MASONRY;
  galleryViewMode: {
    mode: GALLERY_VIEW_SUB_MODE;
    showCover: boolean;
  };
  timelineViewMode: null;
}

export interface TimelineViewMode {
  threadViewMode: THREAD_VIEW_MODE.TIMELINE;
  galleryViewMode: null;
  timelineViewMode: TIMELINE_VIEW_SUB_MODE;
}

export type ThreadViewMode =
  | ClassicThreadViewMode
  | GalleryViewMode
  | TimelineViewMode;

export const getThreadViewTypeFromString = (
  viewString: ThreadType["defaultView"] | null
) => {
  if (!viewString) {
    return null;
  }
  switch (viewString) {
    case "gallery":
      return THREAD_VIEW_MODE.MASONRY;
    case "timeline":
      return THREAD_VIEW_MODE.TIMELINE;
    case "thread":
      return THREAD_VIEW_MODE.THREAD;
  }
};

export const ThreadViewQueryParams = {
  gallery: ExistanceParam,
  timeline: ExistanceParam,
  thread: ExistanceParam,
};

export const TimelineViewQueryParams = {
  new: ExistanceParam,
  latest: ExistanceParam,
  all: ExistanceParam,
};

export const GalleryViewQueryParams = {
  new: ExistanceParam,
  all: ExistanceParam,
  showCover: ExistanceParam,
};

export const VIEW_QUERY_PARAMS = {
  ...ThreadViewQueryParams,
  ...TimelineViewQueryParams,
  ...GalleryViewQueryParams,
};

export type GalleryViewSpecialParamsType = DecodedValueMap<
  typeof GalleryViewQueryParams
>;
export type TimelineViewSpecialParamsType = DecodedValueMap<
  typeof TimelineViewQueryParams
>;

export interface ThreadViewQueryParamsType {
  thread: true;
  gallery: false;
  timeline: false;
}

export interface DefaultBaseViewQueryParamsType {
  thread: false;
  gallery: false;
  timeline: false;
}

export interface GalleryViewQueryParamsType
  extends GalleryViewSpecialParamsType {
  thread: false;
  gallery: true;
  timeline: false;
}

export interface DefaultGalleryViewQueryParamsType
  extends GalleryViewSpecialParamsType {
  thread: false;
  gallery: false;
  timeline: false;
}

export interface TimelineViewQueryParamsType
  extends TimelineViewSpecialParamsType {
  thread: false;
  gallery: false;
  timeline: true;
}

export interface DefaultTimelineViewQueryParamsType
  extends TimelineViewSpecialParamsType {
  thread: false;
  gallery: false;
  timeline: false;
}

export type ViewQueryParamsType =
  | ThreadViewQueryParamsType
  | GalleryViewQueryParamsType
  | TimelineViewQueryParamsType;

export type DefaultViewQueryParamsType =
  | DefaultGalleryViewQueryParamsType
  | DefaultTimelineViewQueryParamsType;

const includesGalleryViewSpecialParam = (
  queryParams: DefaultViewQueryParamsType
) => {
  return (
    queryParams.all == true ||
    queryParams.new == true ||
    ("showCover" in queryParams && queryParams.showCover == true)
  );
};

const includesTimelineViewSpecialParam = (
  queryParams: DefaultViewQueryParamsType
) => {
  return (
    queryParams.all == true ||
    queryParams.new == true ||
    ("latest" in queryParams && queryParams.latest == true)
  );
};

const isDefaultViewQueryParams = (
  queryParams: ViewQueryParamsType | DefaultViewQueryParamsType
): queryParams is DefaultViewQueryParamsType => {
  return (
    queryParams.gallery == false &&
    queryParams.thread == false &&
    queryParams.timeline == false
  );
};

export const isGalleryViewQueryParams = (
  queryParams: ViewQueryParamsType | DefaultViewQueryParamsType
): queryParams is
  | GalleryViewQueryParamsType
  | DefaultGalleryViewQueryParamsType => {
  return (
    queryParams.gallery == true ||
    (isDefaultViewQueryParams(queryParams) &&
      includesGalleryViewSpecialParam(queryParams))
  );
};

export const isTimelineViewQueryParams = (
  queryParams: ViewQueryParamsType | DefaultViewQueryParamsType
): queryParams is
  | TimelineViewQueryParamsType
  | DefaultTimelineViewQueryParamsType => {
  return (
    queryParams.timeline == true ||
    (isDefaultViewQueryParams(queryParams) &&
      includesTimelineViewSpecialParam(queryParams))
  );
};

export const isThreadViewQueryParams = (
  queryParams: ViewQueryParamsType
): queryParams is ThreadViewQueryParamsType => {
  return queryParams.thread == true;
};
