import { describe, expect, it } from "vitest";
import { getSelectionKind, isSingleEnglishWord } from "../word";

describe("word detection", () => {
  it("accepts simple words, hyphenated words, and contractions", () => {
    expect(isSingleEnglishWord("architecture")).toBe(true);
    expect(isSingleEnglishWord("state-of-the-art")).toBe(true);
    expect(isSingleEnglishWord("don't")).toBe(true);
  });

  it("rejects technical identifiers and phrases", () => {
    expect(isSingleEnglishWord("HTTP/2")).toBe(false);
    expect(isSingleEnglishWord("useEffect")).toBe(true);
    expect(isSingleEnglishWord("state of the art")).toBe(false);
  });

  it("returns phrase for non-word selections", () => {
    expect(getSelectionKind("hello world")).toBe("phrase");
  });
});
