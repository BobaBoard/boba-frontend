export const TagMatcher = (tagText: string) => {
  return (_: string, node: HTMLElement) => {
    return node.textContent === tagText && node.classList.contains("tag");
  };
};
