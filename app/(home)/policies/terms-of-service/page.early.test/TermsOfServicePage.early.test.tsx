// Unit tests for: TermsOfServicePage

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("TermsOfServicePage() TermsOfServicePage method", () => {
  // Happy path tests
  describe("Happy Path", () => {
    it("should render the Navbar component", () => {
      // This test checks if the Navbar component is rendered
      render(<TermsOfServicePage />);
      const navbar = screen.getByRole("navigation"); // Assuming Navbar has a role of navigation
      expect(navbar).toBeInTheDocument();
    });

    it("should render the Footer component", () => {
      // This test checks if the Footer component is rendered
      render(<TermsOfServicePage />);
      const footer = screen.getByRole("contentinfo"); // Assuming Footer has a role of contentinfo
      expect(footer).toBeInTheDocument();
    });

    it("should render the main heading", () => {
      // This test checks if the main heading is rendered
      render(<TermsOfServicePage />);
      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toHaveTextContent("Terms of Service");
    });

    it("should render all section headings", () => {
      // This test checks if all section headings are rendered
      render(<TermsOfServicePage />);
      const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
      expect(sectionHeadings).toHaveLength(7);
      expect(sectionHeadings[0]).toHaveTextContent("1. Acceptance of Terms");
      expect(sectionHeadings[1]).toHaveTextContent("2. Use of Service");
      expect(sectionHeadings[2]).toHaveTextContent("3. User Accounts");
      expect(sectionHeadings[3]).toHaveTextContent("4. Intellectual Property");
      expect(sectionHeadings[4]).toHaveTextContent(
        "5. Limitation of Liability"
      );
      expect(sectionHeadings[5]).toHaveTextContent("6. Changes to Terms");
      expect(sectionHeadings[6]).toHaveTextContent("7. Governing Law");
    });
  });

  // Edge case tests
  describe("Edge Cases", () => {
    it("should handle missing Navbar component gracefully", () => {
      // This test checks if the page renders without crashing even if Navbar is not present
      jest.mock("@/components/navbar", () => () => null);
      render(<TermsOfServicePage />);
      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it("should handle missing Footer component gracefully", () => {
      // This test checks if the page renders without crashing even if Footer is not present
      jest.mock("@/components/footer", () => () => null);
      render(<TermsOfServicePage />);
      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });
  });
});

// End of unit tests for: TermsOfServicePage
