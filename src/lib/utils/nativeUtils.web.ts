export function showToast(badgeName: string) {
  console.log(
    `[NATIVEUTILS] showToast is stubbed on web (toast: ${badgeName})`,
  );
}

export function DOMParserFunction() {
  // @ts-expect-error this will be defined on web
  return new DOMParser();
}
