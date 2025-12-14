import {
  convertTaxRateToMultiplier,
  convertMultiplierToTaxRate,
} from "@/lib/utils/taxRate";

describe("convertTaxRateToMultiplier", () => {
  describe("valid percentage formats", () => {
    it("should convert tax rate with % prefix to multiplier", () => {
      expect(convertTaxRateToMultiplier("%20")).toBe("1.20");
    });

    it("should convert tax rate without % prefix to multiplier", () => {
      expect(convertTaxRateToMultiplier("20")).toBe("1.20");
    });

    it("should convert 0% tax rate to 1.00 multiplier", () => {
      expect(convertTaxRateToMultiplier("%0")).toBe("1.00");
      expect(convertTaxRateToMultiplier("0")).toBe("1.00");
    });

    it("should convert 5% tax rate to 1.05 multiplier", () => {
      expect(convertTaxRateToMultiplier("%5")).toBe("1.05");
      expect(convertTaxRateToMultiplier("5")).toBe("1.05");
    });

    it("should convert 10% tax rate to 1.10 multiplier", () => {
      expect(convertTaxRateToMultiplier("%10")).toBe("1.10");
      expect(convertTaxRateToMultiplier("10")).toBe("1.10");
    });

    it("should convert 15% tax rate to 1.15 multiplier", () => {
      expect(convertTaxRateToMultiplier("%15")).toBe("1.15");
    });

    it("should convert very high tax rate like 100% to 2.00 multiplier", () => {
      expect(convertTaxRateToMultiplier("%100")).toBe("2.00");
    });
  });

  describe("edge cases and invalid inputs", () => {
    it("should return 1.0 for empty string", () => {
      expect(convertTaxRateToMultiplier("")).toBe("1.0");
    });

    it("should return 1.0 for string with no numbers", () => {
      expect(convertTaxRateToMultiplier("abc")).toBe("1.0");
      expect(convertTaxRateToMultiplier("%")).toBe("1.0");
      expect(convertTaxRateToMultiplier("tax")).toBe("1.0");
    });

    it("should return 1.0 for special characters only", () => {
      expect(convertTaxRateToMultiplier("@#$")).toBe("1.0");
    });

    it("should handle strings with spaces", () => {
      expect(convertTaxRateToMultiplier("% 20")).toBe("1.20");
      expect(convertTaxRateToMultiplier("20 %")).toBe("1.20");
    });

    it("should handle leading zeros", () => {
      expect(convertTaxRateToMultiplier("020")).toBe("1.20");
      expect(convertTaxRateToMultiplier("%005")).toBe("1.05");
    });
  });

  describe("format variations", () => {
    it("should handle percentage symbol at the end", () => {
      expect(convertTaxRateToMultiplier("20%")).toBe("1.20");
    });

    it("should round to 2 decimal places", () => {
      expect(convertTaxRateToMultiplier("33")).toBe("1.33");
      expect(convertTaxRateToMultiplier("67")).toBe("1.67");
    });
  });
});

describe("convertMultiplierToTaxRate", () => {
  describe("valid multiplier formats", () => {
    it("should convert 1.20 multiplier to %20 tax rate", () => {
      expect(convertMultiplierToTaxRate("1.20")).toBe("%20");
    });

    it("should convert 1.00 multiplier to %0 tax rate", () => {
      expect(convertMultiplierToTaxRate("1.00")).toBe("%0");
      expect(convertMultiplierToTaxRate("1.0")).toBe("%0");
      expect(convertMultiplierToTaxRate("1")).toBe("%0");
    });

    it("should convert 1.05 multiplier to %5 tax rate", () => {
      expect(convertMultiplierToTaxRate("1.05")).toBe("%5");
    });

    it("should convert 1.10 multiplier to %10 tax rate", () => {
      expect(convertMultiplierToTaxRate("1.10")).toBe("%10");
      expect(convertMultiplierToTaxRate("1.1")).toBe("%10");
    });

    it("should convert 1.15 multiplier to %15 tax rate", () => {
      expect(convertMultiplierToTaxRate("1.15")).toBe("%15");
    });

    it("should convert 2.00 multiplier to %100 tax rate", () => {
      expect(convertMultiplierToTaxRate("2.00")).toBe("%100");
      expect(convertMultiplierToTaxRate("2.0")).toBe("%100");
      expect(convertMultiplierToTaxRate("2")).toBe("%100");
    });
  });

  describe("rounding behavior", () => {
    it("should handle decimal multipliers correctly", () => {
      expect(convertMultiplierToTaxRate("1.33")).toBe("%33");
      expect(convertMultiplierToTaxRate("1.67")).toBe("%67");
    });
  });

  describe("edge cases and invalid inputs", () => {
    it("should return %0 for multiplier less than 1.0", () => {
      expect(convertMultiplierToTaxRate("0.9")).toBe("%0");
      expect(convertMultiplierToTaxRate("0.5")).toBe("%0");
      expect(convertMultiplierToTaxRate("0")).toBe("%0");
    });

    it("should return %0 for negative multiplier", () => {
      expect(convertMultiplierToTaxRate("-1")).toBe("%0");
      expect(convertMultiplierToTaxRate("-0.5")).toBe("%0");
    });

    it("should return %0 for NaN inputs", () => {
      expect(convertMultiplierToTaxRate("abc")).toBe("%0");
      expect(convertMultiplierToTaxRate("")).toBe("%0");
      expect(convertMultiplierToTaxRate("not a number")).toBe("%0");
    });

    it("should return %0 for special characters", () => {
      expect(convertMultiplierToTaxRate("@#$")).toBe("%0");
      expect(convertMultiplierToTaxRate("!@#")).toBe("%0");
    });
  });

  describe("high multiplier values", () => {
    it("should handle multipliers greater than 2.0", () => {
      expect(convertMultiplierToTaxRate("3.0")).toBe("%200");
      expect(convertMultiplierToTaxRate("2.5")).toBe("%150");
    });

    it("should handle very high multipliers", () => {
      expect(convertMultiplierToTaxRate("5.0")).toBe("%400");
      expect(convertMultiplierToTaxRate("10.0")).toBe("%900");
    });
  });
});
