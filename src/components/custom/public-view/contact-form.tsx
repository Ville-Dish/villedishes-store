"use client";

import { PageHeader } from "@/app/(home)/page-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { testEmail } from "@/lib/constantData";
import { ContactFormData, contactSchema } from "@/lib/schemas/contactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Earth, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CustomPhoneInput } from "../phone-input";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ADMIN_EMAIL } from "@/config/constants";
import { validateAddressFormat } from "@/lib/utils";

export const ContactForm = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: companyContact } = useSuspenseQuery(
    trpc.adminSettingss.getCompanyContact.queryOptions(),
  );

  const phoneNumber = companyContact.supportPhone;
  const email = companyContact.supportEmail;
  const website = companyContact.website;
  const address = companyContact.address;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      subject: "",
      message: "",
    },
  });

  const sendContactMail = useMutation(
    trpc.mail.sendEmail.mutationOptions({
      onSuccess: () => {
        toast.success("Email Sent", {
          description:
            "An email has been sent to the admin. You should get a response soon.",
        });
        form.reset(); // Clear the form fields after successful submission
      },
      onError: (error) => {
        toast.error("Something went wrong", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
        console.error("Error sending email:", error);
      },
    }),
  );

  const onSubmit = (values: ContactFormData) => {
    const contactData = {
      name: values.name,
      email: values.email,
      phone: values.phoneNumber || "",
      subject: values.subject,
      message: values.message,
    };

    sendContactMail.mutate({
      type: "contact",
      to: ADMIN_EMAIL,
      ...contactData,
    });
  };

  return (
    <div className="w-full flex flex-col gap-4 pl-8 pt-4">
      <main>
        <PageHeader title="Contact Us" url="/contact" />
        <section className="w-full py-2 md:py-4 lg:py-6">
          <div className="px-4 md:px-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-3">
              Contact Us
            </h1>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              <div className="space-y-4">
                {/* Note */}
                <p className="text-gray-500 dark:text-gray-400">
                  We&apos;d love to hear from you. Please fill out the form
                  below or reach out to us using the contact information
                  provided.
                  <span>
                    If you want to inquire about catering, click{" "}
                    <Link href="/catering" className="text-blue-300">
                      here
                    </Link>
                  </span>
                </p>
                {/* Contact Details */}
                <div className="grid grid-cols-2">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-2  text-[#fd9e1d]" />
                    <p>{phoneNumber}</p>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-[#fd9e1d]" />
                    <p>{email}</p>
                  </div>
                  <div className="flex items-center">
                    <Earth className="h-5 w-5 mr-2 text-[#fd9e1d]" />
                    <p>{website}</p>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-[#fd9e1d]" />
                    <p>
                      {validateAddressFormat("CA", address)
                        ? address
                        : "No walk in yet"}
                    </p>
                  </div>
                </div>
                {/* Image */}
                <div>
                  <Image
                    src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1760664836/CalgaryMapquest_pdfx9n.jpg"
                    alt="Map View"
                    width={350}
                    height={50}
                    className="w-87.5 h-12.5]"
                  />
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Name*" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Email Address*" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <CustomPhoneInput
                              placeholder="(123) 456-7890*"
                              defaultCountry="CA"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={fieldState.error}
                              //   disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Subject*" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Message*"
                              {...field}
                              className="h-32 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-center w-full">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-[#f5ad07]"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
