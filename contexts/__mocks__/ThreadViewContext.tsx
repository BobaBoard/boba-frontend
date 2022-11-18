const { THREAD_VIEW_MODE } = jest.requireActual("../ThreadViewContext");

module.exports = {
  ...jest.requireActual("../ThreadViewContext"),
  useThreadViewContext: jest.fn(() => ({
    currentThreadViewMode: THREAD_VIEW_MODE.THREAD,
    timelineViewMode: jest.fn(),
    galleryViewMode: jest.fn(),
    setThreadViewMode: jest.fn(),
    setGalleryViewMode: jest.fn(),
    setTimelineViewMode: jest.fn(),
    addOnChangeHandler: jest.fn(),
    removeOnChangeHandler: jest.fn(),
  })),
};
