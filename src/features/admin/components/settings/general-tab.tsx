"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Upload,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useForm } from "react-hook-form";
import { companySettingsSchema, CompanySettingsValue } from "../../lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";

interface GeneralSettingsProps {
  initialSettings?: Partial<CompanySettingsValue>;
}

function DisplayValue({
  value,
  placeholder = "Not set",
  isMultiline = false,
}: {
  value?: string;
  placeholder?: string;
  isMultiline?: boolean;
}) {
  if (!value) {
    return <span className="text-muted-foreground italic">{placeholder}</span>;
  }
  if (isMultiline) {
    return <span className="whitespace-pre-line">{value}</span>;
  }
  return <span>{value}</span>;
}

function DisplayField({
  label,
  value,
  icon,
  placeholder,
  isMultiline = false,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  isMultiline?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm">
        <DisplayValue
          value={value}
          placeholder={placeholder}
          isMultiline={isMultiline}
        />
      </div>
    </div>
  );
}

export const GeneralSettings = ({ initialSettings }: GeneralSettingsProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.adminSettingss.getCompanySettings.queryOptions(),
  );

  const form = useForm<CompanySettingsValue>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      id: data?.id ?? "",
      companyName: data?.companyName ?? initialSettings?.companyName ?? "",
      about: data?.about ?? initialSettings?.about ?? "",
      founderNotes: data?.founderNotes ?? initialSettings?.founderNotes ?? "",
      supportEmail: data?.supportEmail ?? initialSettings?.supportEmail ?? "",
      supportPhone: data?.supportPhone ?? initialSettings?.supportPhone ?? "",
      website: data?.website ?? initialSettings?.website ?? "",
      address: data?.address ?? initialSettings?.address ?? "",
      logoUrl: data?.logoUrl ?? initialSettings?.logoUrl ?? "",
    },
  });

  const updateSettingsMutation = useMutation(
    trpc.adminSettingss.updateCompanySettings.mutationOptions({
      onSuccess: () => {
        toast.success("Company settings updated successfully!");
        queryClient.invalidateQueries(
          trpc.adminSettingss.getCompanySettings.queryOptions(),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update settings: ${error.message}`);
      },
    }),
  );

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        form.setValue("logoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentitySubmit = form.handleSubmit((values) => {
    updateSettingsMutation.mutate(
      { ...values, id: values.id ?? "" },
      {
        onSuccess: () => {
          setIsEditingIdentity(false);
          setLogoPreview(null);
        },
      },
    );
  });

  const handleContactSubmit = form.handleSubmit((values) => {
    updateSettingsMutation.mutate(
      { ...values, id: values.id ?? "" },
      {
        onSuccess: () => {
          setIsEditingContact(false);
        },
      },
    );
  });

  const cancelIdentityEdit = () => {
    form.resetField("companyName");
    form.resetField("about");
    form.resetField("founderNotes");
    form.resetField("logoUrl");
    setIsEditingIdentity(false);
    setLogoPreview(null);
  };

  const cancelContactEdit = () => {
    form.resetField("supportEmail");
    form.resetField("supportPhone");
    form.resetField("website");
    form.resetField("address");
    setIsEditingContact(false);
  };

  const isPending = updateSettingsMutation.isPending;
  const watchedValues = form.watch();

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Company Identity Section */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Company Identity
              </CardTitle>
              <CardDescription>
                Basic information about your company
              </CardDescription>
            </div>
            {!isEditingIdentity && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingIdentity(true)}
              >
                <Pencil className="size-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditingIdentity ? (
              <form onSubmit={handleIdentitySubmit} className="space-y-6">
                {/* Logo Upload */}
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Avatar className="size-20 border-2 border-dashed border-muted-foreground/25">
                            <AvatarImage
                              src={logoPreview || field.value}
                              alt="Company logo"
                            />
                            <AvatarFallback className="bg-muted">
                              <Building2 className="size-8 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-2">
                            <Input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() =>
                                document.getElementById("logo-upload")?.click()
                              }
                            >
                              <Upload className="size-4 mr-2" />
                              Upload Logo
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Recommended: 200x200px, PNG or JPG
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* About */}
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your company..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of your company that may appear on
                        public pages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Founder Notes */}
                <FormField
                  control={form.control}
                  name="founderNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <User className="size-4" />
                        Founder Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your vision, mission, or personal message..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Personal notes or message from the founder (internal
                        use)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelIdentityEdit}
                    disabled={isPending}
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-20 border">
                    <AvatarImage
                      src={watchedValues.logoUrl}
                      alt="Company logo"
                    />
                    <AvatarFallback className="bg-muted">
                      <Building2 className="size-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {watchedValues.companyName}
                    </h3>
                    {!watchedValues.logoUrl && (
                      <p className="text-sm text-muted-foreground">
                        No logo uploaded
                      </p>
                    )}
                  </div>
                </div>

                <DisplayField
                  label="About"
                  value={watchedValues.about}
                  placeholder="No description added"
                  isMultiline
                />

                <DisplayField
                  label="Founder Notes"
                  value={watchedValues.founderNotes}
                  icon={<User className="size-4" />}
                  placeholder="No founder notes"
                  isMultiline
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Phone className="size-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How customers can reach your support team
              </CardDescription>
            </div>
            {!isEditingContact && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingContact(true)}
              >
                <Pencil className="size-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditingContact ? (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Support Email */}
                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Mail className="size-4" />
                          Support Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="support@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Support Phone */}
                  <FormField
                    control={form.control}
                    name="supportPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Phone className="size-4" />
                          Support Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Globe className="size-4" />
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://www.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        Business Address
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            "123 Business St, Suite 100\nCity, State 12345"
                          }
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelContactEdit}
                    disabled={isPending}
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <DisplayField
                  label="Support Email"
                  value={watchedValues.supportEmail}
                  icon={<Mail className="size-4" />}
                  placeholder="No email set"
                />
                <DisplayField
                  label="Support Phone"
                  value={watchedValues.supportPhone}
                  icon={<Phone className="size-4" />}
                  placeholder="No phone set"
                />
                <DisplayField
                  label="Website"
                  value={watchedValues.website}
                  icon={<Globe className="size-4" />}
                  placeholder="No website set"
                />
                <DisplayField
                  label="Business Address"
                  value={watchedValues.address}
                  icon={<MapPin className="size-4" />}
                  placeholder="No address set"
                  isMultiline
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Form>
  );
};
