// Converts an object to urlencoded string. Example: { a:1, b:'2', c:true } -> "a=1&b=2&c=true"
export const toUrlencoded = (input: Record<string, string>) => {
  return new URLSearchParams(Object.entries(input)).toString();
};
