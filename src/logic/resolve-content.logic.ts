export const resovleContent = (x: string) => {
  x = x.replace(/\\par/g, "");
  return x;
};
