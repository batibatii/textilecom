import { formatOrderNumberShort } from "@/lib/utils/orderNumberFormatter";

describe("formatOrderNumberShort", () => {
  it("should format UUID-based order number correctly", () => {
    const input = "ORD-2df30cb5-fdfb-4ef3-bbec-f2fa98fdabcf-000001";
    const expected = "ORD-2df30cb5-000001";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should handle order number with different UUID format", () => {
    const input = "ORD-abc12345-6789-abcd-efgh-ijklmnopqrst-000042";
    const expected = "ORD-abc12345-000042";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should handle order number with many dashes", () => {
    const input = "ORD-a1b2-c3d4-e5f6-g7h8-i9j0-999999";
    const expected = "ORD-a1b2-999999";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should return original if format is already short", () => {
    const input = "ORD-12345-001";
    const expected = "ORD-12345-001";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should return original if only two segments", () => {
    const input = "ORD-12345";
    const expected = "ORD-12345";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should handle empty string", () => {
    const input = "";
    const expected = "";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should handle uppercase letters in UUID", () => {
    const input = "ORD-ABC123DE-FGHI-JKLM-NOPQ-RSTUV-000123";
    const expected = "ORD-ABC123DE-000123";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should handle counter with leading zeros", () => {
    const input = "ORD-xyz789-abcd-efgh-ijkl-mnop-000001";
    const expected = "ORD-xyz789-000001";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });

  it("should handle large counter numbers", () => {
    const input = "ORD-test1234-abcd-efgh-ijkl-mnop-999999";
    const expected = "ORD-test1234-999999";
    expect(formatOrderNumberShort(input)).toBe(expected);
  });
});
