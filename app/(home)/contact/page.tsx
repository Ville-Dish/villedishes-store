"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Earth, Mail, Phone } from "lucide-react";
import { PageHeader } from "../page-header";
import { testEmail } from "@/lib/constantData";

interface ContactDetails {
  subject?: string;
  name: string;
  message: string;
  email: string;
  phone: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }).max(50),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(12)
    .optional(),
  subject: z.string().min(2, "Subject is required").max(100),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500),
});

const Contact = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const sendContactEmail = (contactDetails: ContactDetails) => {
    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: contactDetails.email,
        to: testEmail,
        subject: contactDetails.subject,
        name: contactDetails.name,
        email: contactDetails.email,
        phone: contactDetails.phone,
        message: contactDetails.message,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send email");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Email sent successfully:", data);
        toast.success("Email Sent", {
          description:
            "An email has been sent to the admin. You should get a response soon.",
        });
        form.reset(); // Clear the form fields after successful submission
      })
      .catch((error) => {
        toast.error("Something went wrong", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
        console.error("Error sending email:", error);
      });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const contactData = {
      name: values.name,
      email: values.email,
      phone: values.phone || "",
      subject: values.subject,
      message: values.message,
    };

    sendContactEmail(contactData);
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
                <p className="text-gray-500 dark:text-gray-400">
                  We&apos;d love to hear from you. Please fill out the form
                  below or reach out to us using the contact information
                  provided.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-2  text-yellow-500" />
                    <p>+1 234 567 8900</p>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-yellow-500" />
                    <p>villedishes@gmail.com</p>
                  </div>
                  <div className="flex items-center">
                    <Earth className="h-5 w-5 mr-2 text-yellow-500" />
                    <p>www.villedishes.com</p>
                  </div>
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Phone Number (Optional)"
                              {...field}
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
                    <Button type="submit" className="w-full sm:w-auto">
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

export default Contact;
