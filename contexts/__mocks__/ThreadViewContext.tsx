const { THREAD_VIEW_MODES } = jest.requireActual("../ThreadViewContext");

module.exports = {
  ...jest.requireActual("../ThreadViewContext"),
  useThreadViewContext: jest.fn(() => ({
    currentThreadViewMode: THREAD_VIEW_MODES.THREAD,
    timelineViewMode: jest.fn(),
    galleryViewMode: jest.fn(),
    activeFilters: null,
    excludedNotices: null,
    setActiveFilter: jest.fn(),
    setExcludedNotices: jest.fn(),
    setThreadViewMode: jest.fn(),
    setGalleryViewMode: jest.fn(),
    setTimelineViewMode: jest.fn(),
    addOnChangeHandler: jest.fn(),
    removeOnChangeHandler: jest.fn(),
  })),
};
