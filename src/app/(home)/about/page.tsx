"use client";

import { useTRPC } from "@/trpc/client";
import { PageHeader } from "../page-header";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

const About = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: companyDetails } = useSuspenseQuery(
    trpc.adminSettingss.getCompanyIdentity.queryOptions(),
  );

  const about = companyDetails?.about;
  const foundersNote = companyDetails?.founderNotes;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageHeader title="About Us" url="/about" />
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              About Villedishes
            </h1>
            <div className="space-y-6 text-base sm:text-lg">
              {about.map((aboutParagraph, index) => (
                <p key={index + 1} className="text-gray-700 dark:text-gray-300">
                  {aboutParagraph}
                </p>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-center mb-6">
              From Our Founder
            </h2>
            {foundersNote.map((note, index) => (
              <p
                key={index + 1}
                className="text-gray-700 dark:text-gray-300 text-base sm:text-lg text-center mb-6"
              >
                {note}
              </p>
            ))}
            <div className="text-center">
              <h4 className="text-xl font-semibold">Chef Dolapo</h4>
              <h6 className="text-sm text-gray-600 dark:text-gray-400 italic">
                Founder
              </h6>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
