// @ts-ignore
const { THREAD_VIEW_MODE } = jest.requireActual("../ThreadViewContext");

module.exports = {
  ...jest.requireActual("../ThreadViewContext"),
  useThreadViewContext: vi.fn(() => ({
    currentThreadViewMode: THREAD_VIEW_MODE.THREAD,
    timelineViewMode: vi.fn(),
    galleryViewMode: vi.fn(),
    setThreadViewMode: vi.fn(),
    setGalleryViewMode: vi.fn(),
    setTimelineViewMode: vi.fn(),
    addOnChangeHandler: vi.fn(),
    removeOnChangeHandler: vi.fn(),
  })),
};
