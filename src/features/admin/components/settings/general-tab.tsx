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
import ImageUpload from "@/components/custom/imageUpload/ImageUpload";

interface GeneralSettingsProps {
  initialSettings?: Partial<CompanySettingsValue>;
}

// ─── Paragraph <-> text helpers ────────────────────────────────────────────
// about / founderNotes are stored as string[] (one entry per paragraph).
// The textarea works with a single string, split on blank lines.

const paragraphsToText = (paragraphs?: string[]) =>
  (paragraphs ?? []).join("\n\n");

const textToParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

// A textarea that edits a string[] of paragraphs. Keeps its own local text
// state so that reformatting on every keystroke (e.g. collapsing a run of
// blank lines while the user is still typing) doesn't fight the cursor.
// It remounts fresh whenever the parent form section is opened for editing,
// so it always starts in sync with the current field value.
function ParagraphTextarea({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  placeholder,
  rows,
}: {
  value?: string[];
  onChange: (paragraphs: string[]) => void;
  onBlur?: () => void;
  name?: string;
  inputRef?: React.Ref<HTMLTextAreaElement>;
  placeholder?: string;
  rows?: number;
}) {
  const [text, setText] = useState(() => paragraphsToText(value));

  return (
    <Textarea
      ref={inputRef}
      name={name}
      placeholder={placeholder}
      rows={rows}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(textToParagraphs(e.target.value));
      }}
      onBlur={onBlur}
    />
  );
}

function DisplayValue({
  value,
  placeholder = "Not set",
  isMultiline = false,
}: {
  value?: string | string[];
  placeholder?: string;
  isMultiline?: boolean;
}) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="text-muted-foreground italic">{placeholder}</span>
      );
    }
    return (
      <div className="space-y-2">
        {value.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

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
  value?: string | string[];
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

export const GeneralSettings = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAll, setIsEditingAll] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.adminSettingss.getCompanySettings.queryOptions(),
  );

  const form = useForm<CompanySettingsValue>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      id: data?.id ?? "",
      companyName: data?.companyName ?? "",
      about: data?.about ?? [],
      founderNotes: data?.founderNotes ?? [],
      supportEmail: data?.supportEmail ?? "",
      supportPhone: data?.supportPhone ?? "",
      website: data?.website ?? "",
      address: data?.address ?? "",
      logoUrl: data?.logoUrl ?? "",
      assetId: data?.assetId ?? "",
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

  // Saves both identity + contact in one shot
  const handleSaveAll = form.handleSubmit((values) => {
    updateSettingsMutation.mutate(
      { ...values, id: values.id ?? "" },
      {
        onSuccess: () => {
          setIsEditingIdentity(false);
          setIsEditingContact(false);
          setIsEditingAll(false);
          setLogoPreview(null);
        },
      },
    );
  });

  // ── Cancel helpers ────────────────────────────────────────────────────────

  const cancelIdentityEdit = () => {
    form.resetField("companyName");
    form.resetField("about");
    form.resetField("founderNotes");
    form.resetField("logoUrl");
    setIsEditingIdentity(false);
    setLogoPreview(null);
    if (isEditingAll) {
      setIsEditingContact(false);
      setIsEditingAll(false);
    }
  };

  const cancelContactEdit = () => {
    form.resetField("supportEmail");
    form.resetField("supportPhone");
    form.resetField("website");
    form.resetField("address");
    setIsEditingContact(false);
    if (isEditingAll) {
      setIsEditingContact(false);
      setIsEditingAll(false);
    }
  };

  const cancelAll = () => {
    form.reset();
    setIsEditingIdentity(false);
    setIsEditingContact(false);
    setIsEditingAll(false);
    setLogoPreview(null);
  };

  // ── Edit-All trigger ──────────────────────────────────────────────────────

  const handleEditAll = () => {
    setIsEditingIdentity(true);
    setIsEditingContact(true);
    setIsEditingAll(true);
  };

  const isPending = updateSettingsMutation.isPending;
  const watchedValues = form.watch();

  // Whether any section is currently being edited
  const anyEditing = isEditingIdentity || isEditingContact;

  const handleImageChange = (url: string, assetId: string) => {
    form.setValue("logoUrl", url);
    form.setValue("assetId", assetId);
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* ── Top-level Edit All / Save All / Cancel All bar ─────────────── */}
        <div className="flex justify-end gap-2">
          {!anyEditing ? (
            <Button variant="outline" size="sm" onClick={handleEditAll}>
              <Pencil className="size-4 mr-2" />
              Edit All
            </Button>
          ) : isEditingAll ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelAll}
                disabled={isPending}
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveAll}
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save All"}
              </Button>
            </>
          ) : null}
        </div>

        {/* ── Company Identity Section ───────────────────────────────────── */}
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
            {!isEditingIdentity && !isEditingAll && (
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
              <form
                onSubmit={isEditingAll ? undefined : handleIdentitySubmit}
                className="space-y-6"
              >
                {/* Logo Upload */}
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Avatar className="size-5 border-2 border-dashed border-muted-foreground/25">
                            <AvatarImage
                              src={logoPreview || field.value}
                              alt="Company logo"
                            />
                            <AvatarFallback className="bg-muted">
                              <Building2 className="size-8 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-2">
                            <ImageUpload
                              value={""}
                              onChange={handleImageChange}
                              onRemove={() => {
                                form.setValue("logoUrl", "");
                                form.setValue("assetId", "");
                              }}
                            />
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
                        <ParagraphTextarea
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          inputRef={field.ref}
                          placeholder="Tell customers about your company... Separate paragraphs with a blank line."
                          rows={6}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of your company that may appear on
                        public pages. Leave a blank line between paragraphs.
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
                        <ParagraphTextarea
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          inputRef={field.ref}
                          placeholder="Share your vision, mission, or personal message... Separate paragraphs with a blank line."
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Personal notes or message from the founder (internal
                        use). Leave a blank line between paragraphs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditingAll && (
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
                )}
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-10 border">
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

        {/* ── Contact Information Section ────────────────────────────────── */}
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
            {!isEditingContact && !isEditingAll && (
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
              <form
                onSubmit={isEditingAll ? undefined : handleContactSubmit}
                className="space-y-6"
              >
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

                {!isEditingAll && (
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
                )}
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
