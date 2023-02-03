export const TagMatcher = (tagText: string) => {
  return (_: string, node: Element | null) => {
    return node?.textContent === tagText && node?.classList.contains("tag");
  };
};
