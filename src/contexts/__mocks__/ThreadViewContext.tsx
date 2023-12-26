// @ts-expect-error
const { THREAD_VIEW_MODE } = await vi.importActual("../ThreadViewContext");

module.exports = {
  // @ts-expect-error
  ...(await vi.importActual("../ThreadViewContext")),
  useThreadViewContext: vi.fn(() => ({
    // @ts-expect-error
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
