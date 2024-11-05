import React from "react";
import { PageHeader } from "../page-header";

const About = () => {
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
              <p className="text-gray-700 dark:text-gray-300">
                Villedishes was born out of a passion for sharing authentic
                Nigerian cuisine with our community. Our founder, inspired by
                family recipes and a love for cooking, started this business to
                bring the rich, diverse flavors of Nigeria to your table.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We're committed to using the freshest ingredients and
                traditional cooking methods to deliver an unforgettable dining
                experience. Our team of skilled chefs brings years of expertise
                in Nigerian cuisine, ensuring that every dish is prepared with
                care and authenticity.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                At Villedishes, we believe that food is more than just
                sustenance - it's a way to connect with culture, create
                memories, and bring people together. We're proud to serve our
                community and introduce the vibrant flavors of Nigeria to food
                lovers everywhere.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-center mb-6">
              From Our Founder
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg text-center mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              pellentesque turpis id leo sagittis finibus. Praesent pellentesque
              lectus quis turpis convallis, vel dapibus arcu rutrum. Proin
              condimentum quam ac ex rhoncus, vitae malesuada sapien pretium.
              Pellentesque lacinia quis velit a vehicula. Pellentesque dignissim
              nulla vel malesuada ultrices. Sed sollicitudin consectetur tempor.
              Quisque lobortis massa ut lorem ullamcorper, et rhoncus ex
              hendrerit.
            </p>
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
