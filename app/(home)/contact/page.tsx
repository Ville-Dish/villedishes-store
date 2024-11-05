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
  // FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Earth, Mail, Phone } from "lucide-react";
import { PageHeader } from "../page-header";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(12),
  message: z.string().min(10).max(500),
});

const Contact = () => {
  //Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  //Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast.success(
      "Message sent successfully! You should hear back in 3 business days"
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 pl-8 pt-4">
      <main>
        <PageHeader title="Contact Us" url="/contact" />
        <section className="w-full py-2 md:py-4 lg:py-6">
          <div className="px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                  Contact Us
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  We'd love to hear from you. Please fill out the form below or
                  reach out to us using the contact information provided.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-2  text-yellow-500" />
                    <p>+234 123 456 7890</p>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-yellow-500" />
                    <p>villedishes@gmail.comm</p>
                  </div>
                  <div className="flex items-center">
                    <Earth className="h-5 w-5 mr-2 text-yellow-500" />
                    <p>www.villedishes.comm</p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4"></div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          {/* <FormLabel>Name</FormLabel> */}
                          <FormControl>
                            <Input placeholder="Name*" {...field} />
                          </FormControl>
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
                          {/* <FormLabel>Phone Number</FormLabel> */}
                          <FormControl>
                            <Input placeholder="Phone Number*" {...field} />
                          </FormControl>
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
                          {/* <FormLabel>Email Address</FormLabel> */}
                          <FormControl>
                            <Input placeholder="Email Address*" {...field} />
                          </FormControl>
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
                          {/* <FormLabel>Message</FormLabel> */}
                          <FormControl>
                            <Textarea placeholder="Message*" {...field} />
                          </FormControl>
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
