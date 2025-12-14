import { toISOString } from "@/lib/utils/dateFormatter";

describe("toISOString", () => {
  describe("when value is null or undefined", () => {
    it("should return null when value is null", () => {
      expect(toISOString(null)).toBeNull();
    });

    it("should return null when value is undefined", () => {
      expect(toISOString(undefined)).toBeNull();
    });
  });

  describe("when value is a Firestore Timestamp object", () => {
    it("should convert Firestore Timestamp to ISO string", () => {
      const mockDate = new Date("2025-01-15T10:30:00.000Z");
      const mockTimestamp = {
        toDate: jest.fn(() => mockDate),
      };

      const result = toISOString(mockTimestamp);

      expect(mockTimestamp.toDate).toHaveBeenCalled();
      expect(result).toBe("2025-01-15T10:30:00.000Z");
    });

    it("should handle Firestore Timestamp with different dates", () => {
      const mockDate = new Date("2024-12-25T00:00:00.000Z");
      const mockTimestamp = {
        toDate: () => mockDate,
      };

      const result = toISOString(mockTimestamp);

      expect(result).toBe("2024-12-25T00:00:00.000Z");
    });

    it("should work with objects that have toDate as a function property", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-03-20T15:45:30.500Z"),
        otherProperty: "test",
      };

      const result = toISOString(mockTimestamp);

      expect(result).toBe("2025-03-20T15:45:30.500Z");
    });
  });

  describe("when value is a string", () => {
    it("should return the same string when value is already a string", () => {
      const isoString = "2025-01-15T10:30:00.000Z";
      expect(toISOString(isoString)).toBe(isoString);
    });

    it("should return any string value unchanged", () => {
      const customString = "2024-12-14";
      expect(toISOString(customString)).toBe(customString);
    });

    it("should return null when value is empty string", () => {
      expect(toISOString("")).toBeNull();
    });
  });

  describe("when value is an invalid type", () => {
    it("should return null when value is a number", () => {
      expect(toISOString(123456789 as unknown as string)).toBeNull();
    });

    it("should return null when value is a boolean", () => {
      expect(toISOString(true as unknown as string)).toBeNull();
    });

    it("should return null when value is an object without toDate method", () => {
      const obj = { someProperty: "value" };
      expect(
        toISOString(obj as unknown as { toDate?: () => Date })
      ).toBeNull();
    });

    it("should return null when value is an object with toDate but not a function", () => {
      const obj = { toDate: "not a function" };
      expect(
        toISOString(obj as unknown as { toDate?: () => Date })
      ).toBeNull();
    });

    it("should return null when value is an array", () => {
      expect(toISOString([] as unknown as string)).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle Firestore Timestamp with milliseconds", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-01-15T10:30:45.123Z"),
      };

      expect(toISOString(mockTimestamp)).toBe("2025-01-15T10:30:45.123Z");
    });

    it("should handle dates at epoch", () => {
      const mockTimestamp = {
        toDate: () => new Date(0),
      };

      expect(toISOString(mockTimestamp)).toBe("1970-01-01T00:00:00.000Z");
    });

    it("should preserve timezone information in ISO string", () => {
      const isoString = "2025-01-15T10:30:00+05:30";
      expect(toISOString(isoString)).toBe(isoString);
    });
  });
});
