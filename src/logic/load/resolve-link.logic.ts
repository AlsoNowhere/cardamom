export const resolveLink = (content: string) => {
  if (content.includes("HYPERLINK")) {
    const target = "HYPERLINK ";
    const slice = content.substring(
      content.indexOf(target) + target.length,
      content.length
    );
    content = slice.substring(0, slice.indexOf(" "));
  }
  return content;
};
