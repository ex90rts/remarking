import { describe, expect, it } from "vitest";
import { normalizeUrlKey } from "../url";

describe("normalizeUrlKey", () => {
  it("removes hash and lowercases host", () => {
    expect(normalizeUrlKey("https://EXAMPLE.com/Doc/?a=1#section")).toBe("https://example.com/Doc?a=1");
  });

  it("keeps query parameters", () => {
    expect(normalizeUrlKey("https://example.com/doc?version=2&utm_source=x")).toBe(
      "https://example.com/doc?version=2&utm_source=x"
    );
  });

  it("keeps http and https distinct", () => {
    expect(normalizeUrlKey("http://example.com/doc")).toBe("http://example.com/doc");
    expect(normalizeUrlKey("https://example.com/doc")).toBe("https://example.com/doc");
  });
});
