import { AllFalse, MakeRecursiveTypeReadable } from "utils/typescript-utils";

import { DecodedValueMap } from "use-query-params";
import { ExistanceParam } from "../components/QueryParamNextProvider";
import { ThreadType } from "./Types";

// All the view types available for threads
// TODO: rename this to BASE_VIEW_MODE
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

// TODO: rename this to BaseViewMode
export type ThreadViewMode =
  | ClassicThreadViewMode
  | GalleryViewMode
  | TimelineViewMode;

// TODO: rename this to getBaseViewTypeFromString
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

const BaseViewQueryParams = {
  gallery: ExistanceParam,
  timeline: ExistanceParam,
  thread: ExistanceParam,
};

export const ThreadViewQueryParams = BaseViewQueryParams;

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

/**
 * The base value of query params when we're in default view. Contains all
 * the query params for the base view mode, but set to false.
 */
export type BaseDefaultViewQueryParamsType = AllFalse<
  DecodedValueMap<typeof BaseViewQueryParams>
>;

/**
 * The type of query params when we're in thread view mode.
 * This is either the query params in default mode, or query params
 * with the thread key explicitly set to true.
 */
export type ThreadViewQueryParamsType = MakeRecursiveTypeReadable<
  | BaseDefaultViewQueryParamsType
  | (Omit<BaseDefaultViewQueryParamsType, "thread"> & { thread: true })
>;

/**
 * The query params that are exclusive to gallery view mode.
 */
export type GalleryViewSpecialParamsType = DecodedValueMap<
  typeof GalleryViewQueryParams
>;

/**
 * The type of query params when we're in gallery view mode.
 * This is either the query params in default mode, or query params
 * with the gallery key explicitly set to true.
 */
export type GalleryViewQueryParamsType = MakeRecursiveTypeReadable<
  (
    | BaseDefaultViewQueryParamsType
    | (Omit<BaseDefaultViewQueryParamsType, "gallery"> & {
        gallery: true;
      })
  ) &
    GalleryViewSpecialParamsType
>;

/**
 * The query params that are exclusive to timeline view mode.
 */
export type TimelineViewSpecialParamsType = DecodedValueMap<
  typeof TimelineViewQueryParams
>;

/**
 * The type of query params when we we're in timeline view mode.
 * This is either the query params in default mode, or query params
 * with the timeline key explicitly set to true.
 */
export type TimelineViewQueryParamsType = MakeRecursiveTypeReadable<
  (
    | BaseDefaultViewQueryParamsType
    | (Omit<BaseDefaultViewQueryParamsType, "timeline"> & {
        timeline: true;
      })
  ) &
    TimelineViewSpecialParamsType
>;

/**
 * All possible types of view query params.
 */
export type ViewQueryParamsType =
  | ThreadViewQueryParamsType
  | GalleryViewQueryParamsType
  | TimelineViewQueryParamsType;

/**
 * All possible types of view query params, when the view is currently
 * the default type.
 */
export type DefaultViewQueryParamsType = MakeRecursiveTypeReadable<
  BaseDefaultViewQueryParamsType &
    GalleryViewSpecialParamsType &
    TimelineViewSpecialParamsType
>;

const includesGalleryViewSpecialParam = (
  queryParams: GalleryViewQueryParamsType
) => {
  return (
    queryParams.all == true ||
    queryParams.new == true ||
    ("showCover" in queryParams && queryParams.showCover == true)
  );
};

const includesTimelineViewSpecialParam = (
  queryParams: TimelineViewQueryParamsType
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
): queryParams is GalleryViewQueryParamsType => {
  return (
    queryParams.gallery == true ||
    (isDefaultViewQueryParams(queryParams) &&
      includesGalleryViewSpecialParam(queryParams))
  );
};

export const isTimelineViewQueryParams = (
  queryParams: ViewQueryParamsType | DefaultViewQueryParamsType
): queryParams is TimelineViewQueryParamsType => {
  return (
    queryParams.timeline == true ||
    (isDefaultViewQueryParams(queryParams) &&
      includesTimelineViewSpecialParam(queryParams))
  );
};

export const isThreadViewQueryParams = (
  queryParams: ViewQueryParamsType | DefaultViewQueryParamsType
): queryParams is ThreadViewQueryParamsType => {
  return queryParams.thread == true;
};
