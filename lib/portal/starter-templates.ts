// Ready-made templates. The Elkhorn ones match the Excel reports the team
// used before the portal; the blank one is the starting point for new clients.

import type { Cadence, TemplateSchema } from "./types";

export interface StarterTemplate {
  key: string;
  name: string;
  cadence: Cadence;
  description: string;
  schema: TemplateSchema;
}

export const weeklySocialTemplate: StarterTemplate = {
  key: "weekly-social",
  name: "Weekly Marketing Report",
  cadence: "weekly",
  description: "Social posts, follower counts, page views and email blasts.",
  schema: {
    periodLabel: "For the week of",
    sections: [
      {
        id: "overview",
        type: "stats",
        title: "Marketing Overview",
        fields: [
          { id: "fb_posts", label: "Facebook Posts", format: "number" },
          { id: "ig_posts", label: "Instagram Posts", format: "number" },
          { id: "fb_views", label: "Facebook Post Views", format: "compact", compare: true },
          { id: "ig_views", label: "Instagram Post Views", format: "compact", compare: true },
          { id: "fb_followers", label: "Facebook Followers", format: "number", compare: true, trend: true },
          { id: "ig_followers", label: "Instagram Followers", format: "number", compare: true, trend: true },
        ],
      },
      {
        id: "posts",
        type: "table",
        title: "Social Media Posts",
        numberLabel: "Post",
        emptyText: "No posts this week.",
        columns: [
          { id: "type", label: "Type of Post", format: "text" },
          {
            id: "platform",
            label: "Platform",
            format: "text",
            options: ["Instagram & Facebook", "Instagram", "Facebook"],
          },
          { id: "views", label: "Views", format: "number", total: true },
        ],
      },
      {
        id: "page_views",
        type: "stats",
        title: "Page Views",
        fields: [
          { id: "fb_7", label: "Facebook · past 7 days", format: "change" },
          { id: "ig_7", label: "Instagram · past 7 days", format: "change" },
          { id: "fb_28", label: "Facebook · past 28 days", format: "change" },
          { id: "ig_28", label: "Instagram · past 28 days", format: "change" },
        ],
      },
      {
        id: "emails_sent",
        type: "table",
        title: "Email Blasts Sent",
        emptyText: "No emails were sent this week.",
        columns: [
          { id: "date", label: "Date Sent", format: "date" },
          { id: "content", label: "Email Content", format: "text" },
          { id: "open_rate", label: "Open Rate", format: "percent" },
          { id: "ctr", label: "Click-Through Rate", format: "percent" },
        ],
      },
      {
        id: "emails_upcoming",
        type: "table",
        title: "Upcoming Email Blasts",
        carryOver: true,
        emptyText: "No emails scheduled yet.",
        columns: [
          { id: "date", label: "Date to Be Sent", format: "date" },
          { id: "content", label: "Email Content", format: "text" },
        ],
      },
    ],
  },
};

export function monthlyAdsTemplate(year: number): StarterTemplate {
  return {
    key: "monthly-ads",
    name: "Digital Marketing Ad Report",
    cadence: "monthly",
    description: "Ad campaigns by channel, SEO work, budget tracking and notes.",
    schema: {
      periodLabel: "Reporting period",
      sections: [
        {
          id: "ads",
          type: "ads",
          title: "Ad Report & Overview",
          carryOver: true,
          channels: [
            { id: "social", name: "Social Media Ads", metricLabel: "Link/Ad Clicks" },
            { id: "youtube", name: "YouTube Ads", metricLabel: "Engagements" },
            { id: "google", name: "Google Ads", metricLabel: "Link Clicks" },
          ],
        },
        {
          id: "seo",
          type: "text",
          title: "Search Engine Optimization",
          placeholder: "Tasks completed this month…",
        },
        {
          id: "budget",
          type: "budget",
          title: "Ad Budget Overview & Status",
          year,
          lines: [
            {
              id: "social",
              label: "Social Media Ads",
              annualBudget: 36000,
              openingSpend: 0,
              source: { kind: "channel", sectionId: "ads", channelId: "social" },
            },
            {
              id: "youtube",
              label: "YouTube Ads",
              annualBudget: 24000,
              openingSpend: 0,
              source: { kind: "channel", sectionId: "ads", channelId: "youtube" },
            },
            {
              id: "google",
              label: "Google Ads",
              annualBudget: 12000,
              openingSpend: 0,
              source: { kind: "channel", sectionId: "ads", channelId: "google" },
            },
            {
              id: "seo",
              label: "Search Engine Optimization",
              annualBudget: 12000,
              openingSpend: 0,
              source: { kind: "manual" },
            },
          ],
        },
        {
          id: "notes",
          type: "text",
          title: "General Notes & Comments",
          placeholder: "Highlights, website traffic, what's next…",
        },
      ],
    },
  };
}

export const blankTemplate: StarterTemplate = {
  key: "blank",
  name: "New Report",
  cadence: "monthly",
  description: "Start empty and add your own sections.",
  schema: { periodLabel: "Reporting period", sections: [] },
};

export function starterTemplates(year: number): StarterTemplate[] {
  return [blankTemplate, weeklySocialTemplate, monthlyAdsTemplate(year)];
}
