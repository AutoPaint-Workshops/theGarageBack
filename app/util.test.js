import { expect } from "vitest";
import { parsePaginationParams } from "./utils";

describe("util", () => {
  test("parsePaginationParams ", () => {
    const result = parsePaginationParams({ limit: "10", offset: "10" });
    expect(result).toEqual({ limit: 10, offset: 10 });
  });
});
