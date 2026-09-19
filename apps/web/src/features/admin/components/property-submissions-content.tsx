import {
  CheckCircle2Icon,
  ImageOffIcon,
  PhoneIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  usePropertySubmissions,
  useUpdatePropertySubmissionStatus,
} from "@/features/admin/hooks/use-property-submissions";
import type {
  PropertySubmission,
  PropertySubmissionStatus,
} from "@/lib/api/admin-property-submissions";
import { getImageUrl } from "@/lib/get-image-url";

const TABS: { value: PropertySubmissionStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "listed", label: "Listed" },
  { value: "declined", label: "Declined" },
  { value: "all", label: "All" },
];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

function SubmissionCard({ submission }: { submission: PropertySubmission }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(submission.adminNotes ?? "");
  const updateStatus = useUpdatePropertySubmissionStatus();

  const isPending = submission.status === "pending";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Image */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="block w-full text-left"
      >
        <div className="aspect-[4/3] w-full bg-muted">
          {submission.images[0] ? (
            <img
              src={getImageUrl(submission.images[0], { width: 500 })}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOffIcon className="size-8 text-muted-foreground/50" />
            </div>
          )}
        </div>
      </button>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {submission.propertyType}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(submission.createdAt)}
            </p>
          </div>
          <Badge
            variant={
              submission.status === "listed"
                ? "default"
                : submission.status === "declined"
                  ? "destructive"
                  : "secondary"
            }
          >
            {submission.status}
          </Badge>
        </div>

        <p
          className={`text-sm text-muted-foreground ${expanded ? "" : "line-clamp-2"}`}
        >
          {submission.description}
        </p>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>

        {expanded && (
          <div className="space-y-3 border-t border-border pt-3">
            {submission.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {submission.images.slice(1).map((img) => (
                  <img
                    key={img}
                    src={getImageUrl(img, { width: 150 })}
                    alt=""
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <PhoneIcon className="size-3.5 text-muted-foreground" />
              {submission.submitterName} · {submission.submitterPhone}
            </div>

            {isPending ? (
              <>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes (optional)"
                  rows={2}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({
                        id: submission.id,
                        status: "listed",
                        adminNotes: notes || undefined,
                      })
                    }
                  >
                    <CheckCircle2Icon className="size-3.5" />
                    Mark listed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:bg-destructive/10"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({
                        id: submission.id,
                        status: "declined",
                        adminNotes: notes || undefined,
                      })
                    }
                  >
                    <XCircleIcon className="size-3.5" />
                    Decline
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Marking as "listed" doesn't auto-create a product — add it
                  yourself via Products once reviewed.
                </p>
              </>
            ) : (
              submission.adminNotes && (
                <p className="rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">
                  Note: {submission.adminNotes}
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PropertySubmissionsContent() {
  const [activeTab, setActiveTab] = useState<PropertySubmissionStatus | "all">("pending");
  const { data: submissions, isLoading, isError, error } = usePropertySubmissions(
    activeTab === "all" ? undefined : activeTab,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Property Submissions</h2>
        <p className="text-sm text-muted-foreground">
          Properties submitted by the public for listing review.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            aria-current={activeTab === tab.value}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <p role="alert" className="text-destructive">
          Couldn't load submissions:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      ) : submissions && submissions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No submissions in this view.</p>
        </div>
      )}
    </div>
  );
}