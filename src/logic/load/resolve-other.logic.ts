export const resolveOther = (content: string) => {
  const firstIsContent = content.charAt(0) !== "\\";

  {
    const first = content.charAt(0);
    const last = content.charAt(content.length - 1);

    if (first === `"` && last === `"`) {
      content = content.substring(1, content.length - 1);
    }
  }

  content = content
    .split("\\")
    .reduce((a, b, i) => {
      if (firstIsContent && i === 0) {
        a.push(b);
        return a;
      }

      let tag = b;
      let _content = "";

      if (b.includes(" ")) {
        tag = b.substring(0, b.indexOf(" "));
        _content = b.substring(b.indexOf(" ") + 1, b.length);
      }

      if (tag === "tab") {
        a.push("    ");
      }

      a.push(_content);

      return a;
    }, [] as Array<string>)
    .join("");

  return content;
};
