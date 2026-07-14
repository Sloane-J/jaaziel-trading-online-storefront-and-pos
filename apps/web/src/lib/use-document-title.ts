import { useEffect } from "react";

const SITE_NAME = "Jaaziel Trading Enterprise";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    // Restore the default title when this page unmounts, so navigating away
    // doesn't leave a stale title if the next page doesn't set its own.
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
}