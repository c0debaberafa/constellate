"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import LivingEssay from "@/components/profile/LivingEssay";
import Pillars, { type Pillar, type IconName } from "@/components/profile/Pillars";
import StrengthsShadows from "@/components/profile/StrengthsShadows";
import Forecast from "@/components/profile/Forecast";
import ProfileGenerator from "@/components/profile/ProfileGenerator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileData {
  livingEssay?: string | string[];
  pillars?: Array<{
    title: string;
    writeup: string;
    motivation?: string;
    icon?: string;
  }>;
  strengthsShadows?: {
    strengths?: Array<{
      title: string;
      writeup: string;
    }>;
    shadows?: Array<{
      title: string;
      writeup: string;
    }>;
  };
  forecast?: string;
}

const ICON_NAMES: IconName[] = [
  "Flame",
  "Atom",
  "Waves",
  "Wind",
  "Eclipse",
  "Rainbow",
  "Moon",
  "Heart",
  "Brain",
  "Flower",
  "Sprout",
  "Anchor",
  "Snowflake",
  "Rose",
  "TreePalm",
  "TreePine",
];

const toIconName = (icon?: string): IconName | undefined => {
  if (!icon) return undefined;
  return ICON_NAMES.includes(icon as IconName) ? (icon as IconName) : undefined;
};

const Insights = () => {
  const { userId, isLoaded } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [aiProfile, setAiProfile] = useState<Record<string, unknown> | null>(
    null
  );
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [availableVersions, setAvailableVersions] = useState<
    Array<{ version: number; createdAt?: string }>
  >([]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isLoaded || !userId) {
        return;
      }

      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();

        // Store the full aiProfile object
        if (data.aiProfile && typeof data.aiProfile === "object") {
          setAiProfile(data.aiProfile as Record<string, unknown>);

          // Extract all available versions
          const versions = Object.keys(data.aiProfile)
            .filter((key) => key.startsWith("v"))
            .map((key) => {
              const versionNum = parseInt(key.substring(1));
              const versionData = (data.aiProfile as Record<string, unknown>)[
                key
              ] as Record<string, unknown>;
              return {
                version: versionNum,
                createdAt: versionData.updatingEntryCreatedAt as
                  | string
                  | undefined,
              };
            })
            .sort((a, b) => b.version - a.version); // Sort descending (newest first)

          setAvailableVersions(versions);

          // Set selected version to latest if not already set
          if (versions.length > 0) {
            setSelectedVersion((prev) => {
              // Only update if null or if the current selection is no longer available
              if (prev === null) {
                return versions[0].version;
              }
              // If current selection still exists, keep it; otherwise use latest
              const stillExists = versions.some((v) => v.version === prev);
              return stillExists ? prev : versions[0].version;
            });
          } else {
            setSelectedVersion(null);
          }
        } else {
          setAiProfile(null);
          setAvailableVersions([]);
          setSelectedVersion(null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setAiProfile(null);
        setAvailableVersions([]);
        setSelectedVersion(null);
      }
    };

    // Fetch on mount and when auth is ready
    if (isLoaded && userId) {
      fetchProfileData();
    }

    // Listen for custom refresh event (triggered by ProfileGenerator after successful generation)
    const handleRefresh = () => {
      fetchProfileData();
    };

    window.addEventListener("profileUpdated", handleRefresh);
    return () => {
      window.removeEventListener("profileUpdated", handleRefresh);
    };
  }, [isLoaded, userId]);

  // Update profileData when selectedVersion or aiProfile changes
  useEffect(() => {
    if (aiProfile && selectedVersion !== null) {
      const versionData = aiProfile[`v${selectedVersion}`] as
        | ProfileData
        | undefined;
      setProfileData(versionData || null);
    } else {
      setProfileData(null);
    }
  }, [aiProfile, selectedVersion]);

  const isEmpty = !profileData;

  const formatVersionLabel = (version: number, createdAt?: string) => {
    if (createdAt) {
      const date = new Date(createdAt);
      return `Version ${version} • ${date.toLocaleDateString()} ${date.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`;
    }
    return `Version ${version}`;
  };

  return (
    <div className="w-[90%] md:w-[80%] sm:px-4 mt-24 mb-16">
      <div className="max-w-6xl mx-auto">
        {/* Profile Generator Component - centered at top */}
        <div className="flex justify-center mb-4">
          <div className="w-full">
            <ProfileGenerator />
          </div>
        </div>

        {/* Version Selector */}
        {availableVersions.length > 0 && (
          <div className="flex justify-center mb-4">
            <Select
              value={selectedVersion?.toString() || ""}
              onValueChange={(value) => setSelectedVersion(parseInt(value))}
            >
              <SelectTrigger className="w-fit border-primary/20 text-primary font-mono">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {availableVersions.map((v) => (
                  <SelectItem
                    key={v.version}
                    value={v.version.toString()}
                    className="font-mono"
                  >
                    {formatVersionLabel(v.version, v.createdAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="border-t border-b border-primary/20 py-8">
          {/* Insight Components */}
          <LivingEssay
            content={profileData?.livingEssay}
            isEmpty={isEmpty || !profileData?.livingEssay}
          />
          <Pillars
            pillars={profileData?.pillars?.map((p, index): Pillar => {
              const colors: Pillar["color"][] = [
                "accent",
                "primary",
                "secondary",
                "muted",
              ];
              return {
                iconName: toIconName(p.icon),
                title: p.title,
                description: p.writeup,
                motivation: p.motivation,
                color: colors[index % colors.length],
              };
            })}
            isEmpty={isEmpty || !profileData?.pillars}
          />
          <StrengthsShadows
            strengths={profileData?.strengthsShadows?.strengths || []}
            shadows={profileData?.strengthsShadows?.shadows || []}
            isEmpty={
              isEmpty ||
              !profileData?.strengthsShadows?.strengths ||
              !profileData?.strengthsShadows?.shadows
            }
          />
          <Forecast
            forecast={profileData?.forecast}
            isEmpty={isEmpty || !profileData?.forecast}
          />
        </div>
      </div>
    </div>
  );
};

export default Insights;
