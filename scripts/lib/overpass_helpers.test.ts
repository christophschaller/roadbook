import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isRateLimitError } from "../../src/lib/overpass_helpers.js";

describe("isRateLimitError", () => {
  it("detects Too Many Requests message", () => {
    assert.equal(
      isRateLimitError(new Error("Too Many Requests")),
      true,
    );
  });

  it("detects 429 in message", () => {
    assert.equal(isRateLimitError(new Error("HTTP 429")), true);
  });

  it("detects rate limit wording", () => {
    assert.equal(
      isRateLimitError(new Error("rate limit exceeded")),
      true,
    );
  });

  it("returns false for other errors", () => {
    assert.equal(isRateLimitError(new Error("Gateway Timeout")), false);
    assert.equal(isRateLimitError(new Error("ENOENT")), false);
  });

  it("handles non-Error values", () => {
    assert.equal(isRateLimitError("Too Many Requests"), true);
    assert.equal(isRateLimitError("timeout"), false);
  });
});
