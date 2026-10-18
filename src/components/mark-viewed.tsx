"use client";

import { useEffect } from "react";
import { markTopicViewedAction } from "@/lib/actions";

export function MarkTopicViewed({ topicId }: { topicId: string }) {
  useEffect(() => {
    void markTopicViewedAction(topicId);
  }, [topicId]);

  return null;
}
