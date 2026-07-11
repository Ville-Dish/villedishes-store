import {
  formatDate,
  INVOICE_STATUSES,
  InvoiceStatus,
  isValidEmail,
  isValidInvoiceStatus,
  isValidPhoneNumber,
  isValidPostalCode,
  passwordStrength,
} from "@/lib/utils";
import { faker, fakerEN_CA, fakerEN_US } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Utility functions", () => {
  beforeEach(() => {});

  describe("Invoice Status Validation Function", () => {
    describe("valid statuses", () => {
      it.each(INVOICE_STATUSES)('returns true for "%s"', (status) => {
        expect(isValidInvoiceStatus(status)).toBe(true);
      });
    });

    describe("invalid statuses", () => {
      it("returns false for an unrecognised string", () => {
        expect(isValidInvoiceStatus("REFUNDED")).toBe(false);
      });

      it("returns false for an empty string", () => {
        expect(isValidInvoiceStatus("")).toBe(false);
      });

      it("returns false for lowercase variants", () => {
        expect(isValidInvoiceStatus("paid")).toBe(false);
        expect(isValidInvoiceStatus("unpaid")).toBe(false);
      });

      it("returns false for a status with surrounding whitespace", () => {
        expect(isValidInvoiceStatus(" PAID")).toBe(false);
        expect(isValidInvoiceStatus("PAID ")).toBe(false);
      });
    });

    describe("type narrowing", () => {
      it("narrows the type to InvoiceStatus when true", () => {
        const status: string = "PAID";
        if (isValidInvoiceStatus(status)) {
          const narrowed: InvoiceStatus = status; // would be a compile error if predicate is wrong
          expect(narrowed).toBe("PAID");
        }
      });

      it("does not narrow when false", () => {
        const status: string = "REFUNDED";
        expect(isValidInvoiceStatus(status)).toBe(false);
      });
    });
  });

  // Format Date Function
  describe("Format Date Function", () => {
    it("formats a date correctly", () => {
      const date = new Date("2026-06-03T00:00:00-06:00");
      expect(formatDate(date)).toBe("Wednesday, June 3, 2026");
    });

    it("formats first day of the year", () => {
      const date = new Date("2026-01-01T00:00:00-06:00");
      expect(formatDate(date)).toBe("Thursday, January 1, 2026");
    });

    it("formats the last day of the year correctly", () => {
      const date = new Date("2025-12-31T00:00:00-06:00");
      expect(formatDate(date)).toBe("Wednesday, December 31, 2025");
    });

    it("formats a leap year date correctly", () => {
      const leapDay = new Date(Date.UTC(2024, 1, 29)); // Note: Months are 0-indexed (0=Jan, 1=Feb)
      const date = leapDay;
      expect(formatDate(date)).toBe("Thursday, February 29, 2024");
    });

    it("throws when passed an invalid date object", () => {
      const invalidDate = new Date("not-a-date");
      const result = formatDate(invalidDate);

      expect(result).toBe("Invalid Date");
    });

    it("handles the Unix epoch (new Date(0))", () => {
      const date = new Date(0);
      expect(formatDate(date)).toBe("Thursday, January 1, 1970");
    });

    it("handles the maximum valid JS timestamp", () => {
      const date = new Date(8640000000000000);
      expect(formatDate(date)).toBe("Saturday, September 13, 275760");
    });

    it("handles the minimum valid JS timestamp", () => {
      const date = new Date(-8640000000000000);
      expect(formatDate(date)).toMatch(/^Tuesday, April 20, -?\d+$/);
    });
  });

  // Postal Code Validation Function
  describe("Postal Code Validation Function", () => {
    it("validates US postal codes correctly", () => {
      const validUSPostalCodes = faker.helpers.multiple(
        () => fakerEN_US.location.zipCode(),
        { count: 5 },
      );
      validUSPostalCodes.forEach((code) => {
        expect(isValidPostalCode(code, "US")).toBe(true);
      });
    });

    it("validates CA postal codes correctly", () => {
      const knownValidCAPostalCodes = [
        "A1A1A1", // Newfoundland
        "B3H4R2", // Nova Scotia
        "K1A0A9", // Ottawa
        "M5V2T6", // Toronto
        "V6B2W9", // Vancouver
        "T2P1J9", // Calgary
      ];

      knownValidCAPostalCodes.forEach((code) => {
        expect(isValidPostalCode(code, "CA")).toBe(true);
      });
    });

    it("returns false for invalid postal codes", () => {
      const invalidPostalCodes = ["123456", "12345-67890"];
      invalidPostalCodes.forEach((code) => {
        expect(isValidPostalCode(code, "US")).toBe(false);
      });
    });

    it("returns false when postalCode is empty", () => {
      expect(isValidPostalCode("", "US")).toBe(false);
    });

    it("returns false when countryCode is empty", () => {
      expect(isValidPostalCode("12345", "")).toBe(false);
    });

    it("falls back to length check for unsupported countries", () => {
      expect(isValidPostalCode("ABC12", "ZZ")).toBe(true); // 5 chars, passes
      expect(isValidPostalCode("AB", "ZZ")).toBe(false); // 2 chars, too short
      expect(isValidPostalCode("AB12345678901", "ZZ")).toBe(false); // too long
    });
  });

  // Email Validation Function
  describe("Email Validation Function", () => {
    it("validates correct email addresses", () => {
      const validEmails = [
        faker.internet.email(),
        faker.internet.email(),
        faker.internet.email(),
      ];
      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });
    it("invalidates incorrect email addresses", () => {
      const invalidEmails = [
        "plainaddress",
        "@missingusername.com",
        "username@.com",
      ];
      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  // Phone Number Validation Function
  describe("Phone Number Validation Function", () => {
    it("validates correct phone numbers", () => {
      const validPhoneNumbers = faker.helpers.multiple(
        () => fakerEN_CA.phone.number({ style: "national" }),
        { count: 5 },
      );
      validPhoneNumbers.forEach((phone) => {
        expect(isValidPhoneNumber(phone)).toBe(true);
      });
    });
    it("invalidates incorrect phone numbers", () => {
      const invalidPhoneNumbers = [
        "123",
        "12345",
        "+44 20 7123 4567",
        "555-55-5555",
        "abcdefghij",
        "",
      ];
      invalidPhoneNumbers.forEach((phone) => {
        expect(isValidPhoneNumber(phone)).toBe(false);
      });
    });
  });

  // Password Validation Function
  describe("Password Validation Function", () => {
    const generateStrongPassword = (length = 12) =>
      faker.internet.password({
        length: Math.max(length, 8), // enforce the 8 char minimum
        memorable: false,
        pattern: /[a-zA-Z0-9!@#$%^&*]/,
        prefix: "Aa1!",
      });

    const generateGoodPassword = (length = 12) =>
      faker.internet.password({
        length: Math.max(length, 8), // enforce the 8 char minimum
        memorable: false,
        pattern: /[a-zA-Z0-9]/,
        prefix: "Aa1",
      });

    // weak: too short, only lowercase letters
    const generateWeakPassword = () =>
      faker.internet.password({
        length: 4,
        memorable: false,
        pattern: /[a-z]/,
        prefix: "a",
      });

    const generatePasswords = (
      count = 3,
      length = 12,
      variant: "S" | "G" | "W",
    ) =>
      faker.helpers.multiple(
        () => {
          switch (variant) {
            case "S":
              return generateStrongPassword(length);
            case "G":
              return generateGoodPassword(length);
            case "W":
              return generateWeakPassword();
            default:
              return generateStrongPassword(length);
          }
        },
        {
          count: Math.max(count, 3),
        },
      );
    it("validates strong password", () => {
      const strongPasswords = generatePasswords(3, 12, "S");
      strongPasswords.forEach((password) => {
        expect(passwordStrength(password)).toEqual({
          strength: "strong",
          errors: [],
        });
      });
    });

    it("validates good password", () => {
      const goodPasswords = generatePasswords(3, 12, "G");
      goodPasswords.forEach((password) => {
        expect(passwordStrength(password)).toEqual({
          strength: "good",
          errors: ["have at least a special character"],
        });
      });
    });
    it("invalidates weak password", () => {
      const weakPasswords = generatePasswords(3, 4, "W");
      weakPasswords.forEach((password) => {
        expect(passwordStrength(password)).toMatchObject({
          strength: "weak",
        });
      });
    });
  });
});
