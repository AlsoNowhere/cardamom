export const resolveLink = (content: string) => {
  content = content.replace(
    / HYPERLINK "[a-zA-Z0-9()@:%_\-\+.~#?&=\\\/]+"/g,
    ""
  );
  return content;
};
