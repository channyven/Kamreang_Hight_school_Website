"use client";

import type { AppDocument } from "@/types";
import DocumentCard from "./DocumentCard";
import EmptyState from "./EmptyState";
import LoadingSkeleton from "./LoadingSkeleton";

interface DocumentGridProps {
  /** List of documents to display. */
  documents: AppDocument[];
  /** Whether data is still loading. */
  loading?: boolean;
}

/**
 * Responsive grid of document cards.
 * Shows loading skeletons, the cards, or an empty state.
 */
export default function DocumentGrid({ documents, loading = false }: DocumentGridProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc, index) => (
        <DocumentCard key={doc.id} document={doc} index={index} />
      ))}
    </div>
  );
}
