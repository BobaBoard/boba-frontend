export const copyText = (text: string) => {
  const tempInput = document.createElement("input");
  tempInput.style.position = "absolute";
  tempInput.value = text;
  document.body.appendChild(tempInput);
  // tempInput.focus();
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
};

export const getRealmNameFromSlug = (realmSlug: string) => {
  return realmSlug
    .replace(/^(.)/, (c) => c.toUpperCase())
    .replace(/[-](.)/g, (_, c) => " " + c.toUpperCase());
};
