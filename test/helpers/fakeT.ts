import type { TFunction } from "i18next";

/**
 * Every schema factory in `schema/*.ts` takes a real i18next `TFunction`
 * purely to build error messages — always called as `t("some.key")`, a
 * single key, no interpolation. A fake that just echoes the key back is
 * enough to assert *which* validation rule fired, without pulling i18next's
 * actual instance into a unit test. Shared here rather than redefined per
 * schema test file.
 */
export const fakeT = ((key: string) => key) as unknown as TFunction;
