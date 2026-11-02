import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidPhoneNumber } from "../src/lib/validation";

test("accepts formatted international and national phone numbers", () => {
  assert.equal(isValidPhoneNumber("+254 712 345 678"), true);
  assert.equal(isValidPhoneNumber("0712 345 678"), true);
  assert.equal(isValidPhoneNumber("+1 (202) 555-0146"), true);
});

test("rejects phone numbers that are too short, too long, or contain letters", () => {
  assert.equal(isValidPhoneNumber("12345"), false);
  assert.equal(isValidPhoneNumber("+2547123456789012"), false);
  assert.equal(isValidPhoneNumber("0712abc456"), false);
  assert.equal(isValidPhoneNumber("00000000"), false);
});
