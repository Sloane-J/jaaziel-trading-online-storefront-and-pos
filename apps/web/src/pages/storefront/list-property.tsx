import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/features/admin/components/image-upload";
import { useCreatePropertySubmission } from "@/features/storefront/hooks/use-property-submissions";
import { usePublicCategories } from "@/features/storefront/hooks/use-storefront";
import { uploadPropertySubmissionImage } from "@/lib/api/uploads";
import { useDocumentTitle } from "@/lib/use-document-title";

export function ListPropertyPage() {
  useDocumentTitle("List Your Property");

  const { data: categories } = usePublicCategories();
  const inquiryCategories = (categories ?? []).filter((c) => c.isInquiryOnly);

  const [submitterName, setSubmitterName] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubmission = useCreatePropertySubmission();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !submitterName.trim() ||
      !submitterPhone.trim() ||
      !categoryId ||
      !title.trim() ||
      !description.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await createSubmission.mutateAsync({
        submitterName: submitterName.trim(),
        submitterPhone: submitterPhone.trim(),
        categoryId,
        title: title.trim(),
        description: description.trim(),
        images,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (submitted) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-lg px-6 py-16">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/40 bg-success/5 py-12 text-center">
            <CheckCircle2Icon className="size-10 text-success" />
            <p className="text-lg font-semibold text-foreground">
              Submission received
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Thank you. We'll review your property details and reach out on
              the phone number you provided.
            </p>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-lg px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            List Your Property
          </h1>
          <p className="mt-2 text-muted-foreground">
            Selling or renting land, a house, an apartment, or a car? Tell us
            about it and we'll help you find a buyer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="submitter-name">Your name</Label>
            <Input
              id="submitter-name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="e.g. Kwame Mensah"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitter-phone">Phone number</Label>
            <Input
              id="submitter-phone"
              type="tel"
              value={submitterPhone}
              onChange={(e) => setSubmitterPhone(e.target.value)}
              placeholder="e.g. 0244123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {inquiryCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Listing title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3-Bedroom House in East Legon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Location, size, price expectations, and any other details."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Photos (optional)</Label>
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={5}
              uploadFn={uploadPropertySubmissionImage}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {createSubmission.isError && (
            <p role="alert" className="text-sm text-destructive">
              {createSubmission.error instanceof Error
                ? createSubmission.error.message
                : "Something went wrong. Please try again."}
            </p>
          )}

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={createSubmission.isPending}
          >
            {createSubmission.isPending ? "Submitting..." : "Submit for review"}
          </Button>
        </form>
      </div>
    </StorefrontLayout>
  );
}