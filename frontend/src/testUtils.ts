/**
 * Flexible matcher for React Testing Library to match text even if split across elements.
 * Usage: screen.getByText(flexibleTextMatcher(/Real-time Monitoring/i))
 */
export function flexibleTextMatcher(pattern: RegExp) {
  return (content: string, node: Element | null) => {
    const text = node?.textContent || "";
    return pattern.test(text);
  };
}
