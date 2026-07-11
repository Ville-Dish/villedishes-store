import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCallerFactory } from "@/trpc/init";
import prisma from "@/lib/prisma/client";
import { testimonialsRouter } from "@/features/testimonials/server/procedures";
import { mockTrpcContext } from "../../helpers/trpc";

vi.mock("@/lib/prisma/client", () => ({
  default: {
    testimonial: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const createCaller = createCallerFactory(testimonialsRouter);

describe("testimonialsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTestimonials", () => {
    it("returns only approved testimonials, newest first", async () => {
      const testimonials = [
        {
          id: "t1",
          comment: "Lovely food",
          authorName: "Jane",
          isApproved: true,
          createdAt: new Date("2025-01-01"),
        },
      ];
      vi.mocked(prisma.testimonial.findMany).mockResolvedValue(
        testimonials as never,
      );

      const caller = createCaller(mockTrpcContext());
      const result = await caller.getTestimonials();

      expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(testimonials);
    });
  });

  describe("createTestimonial", () => {
    it("creates an anonymous testimonial pending approval", async () => {
      const created = {
        id: "t2",
        comment: "Great service",
        authorName: "Anonymous",
        isApproved: false,
        createdAt: new Date(),
      };
      vi.mocked(prisma.testimonial.create).mockResolvedValue(created as never);

      const caller = createCaller(mockTrpcContext());
      const result = await caller.createTestimonial({
        comment: "Great service",
        isAnonymous: true,
      });

      expect(prisma.testimonial.create).toHaveBeenCalledWith({
        data: {
          comment: "Great service",
          authorName: "Anonymous",
          isApproved: false,
        },
      });
      expect(result).toEqual(created);
    });

    it("creates a named testimonial when not anonymous", async () => {
      const created = {
        id: "t3",
        comment: "Will order again",
        authorName: "Alex",
        isApproved: false,
        createdAt: new Date(),
      };
      vi.mocked(prisma.testimonial.create).mockResolvedValue(created as never);

      const caller = createCaller(mockTrpcContext());
      const result = await caller.createTestimonial({
        comment: "Will order again",
        authorName: "Alex",
        isAnonymous: false,
      });

      expect(prisma.testimonial.create).toHaveBeenCalledWith({
        data: {
          comment: "Will order again",
          authorName: "Alex",
          isApproved: false,
        },
      });
      expect(result).toEqual(created);
    });

    it("rejects input that fails Zod validation before hitting the handler", async () => {
      const caller = createCaller(mockTrpcContext());

      await expect(
        caller.createTestimonial({
          comment: "",
          isAnonymous: true,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });

      expect(prisma.testimonial.create).not.toHaveBeenCalled();
    });

    it("maps business-rule failures to a generic error", async () => {
      const caller = createCaller(mockTrpcContext());

      await expect(
        caller.createTestimonial({
          comment: "Nice",
          authorName: "Should not be set",
          isAnonymous: true,
        }),
      ).rejects.toThrow("Failed to create testimonial");

      expect(prisma.testimonial.create).not.toHaveBeenCalled();
    });
  });
});
