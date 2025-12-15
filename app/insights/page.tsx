"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Heart, Landmark, Flame, Anchor } from "lucide-react";
import LivingEssay from "@/components/LivingEssay";
import Pillars from "@/components/Pillars";
import StrengthsShadows from "@/components/StrengthsShadows";
import Forecast from "@/components/Forecast";
import ProfileGenerator from "@/components/ProfileGenerator";

interface ProfileData {
  livingEssay?: string;
  pillars?: Array<{
    title: string;
    writeup: string;
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

const Insights = () => {
  const { userId, isLoaded } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

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

        // Extract the latest version from aiProfile
        // aiProfile is structured as { v1: {...}, v2: {...}, ... }
        if (data.aiProfile && typeof data.aiProfile === "object") {
          const versions = Object.keys(data.aiProfile)
            .filter((key) => key.startsWith("v"))
            .map((key) => parseInt(key.substring(1)))
            .sort((a, b) => b - a); // Sort descending to get latest version

          if (versions.length > 0) {
            const latestVersion = versions[0];
            const latestData = data.aiProfile[`v${latestVersion}`];
            setProfileData(latestData || null);
          } else {
            setProfileData(null);
          }
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setProfileData(null);
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

  const isEmpty = !profileData;

  return (
    <div className="w-[90%] md:w-[80%] py-8 sm:px-4 sm:py-12 mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Profile Generator Component - centered at top */}
        <div className="flex justify-center mb-8">
          <div className="w-full">
            <ProfileGenerator />
          </div>
        </div>

        {/* Insight Components */}
        <LivingEssay
          content={profileData?.livingEssay}
          isEmpty={isEmpty || !profileData?.livingEssay}
        />
        <Pillars
          pillars={profileData?.pillars?.map((p, index) => {
            // Map icons based on index
            const icons = [
              <Heart key="heart" className="w-6 h-6" />,
              <Landmark key="landmark" className="w-6 h-6" />,
              <Flame key="flame" className="w-6 h-6" />,
              <Anchor key="anchor" className="w-6 h-6" />,
            ];
            const colors: Array<"primary" | "accent" | "muted" | "secondary"> =
              ["accent", "primary", "secondary", "muted"];
            return {
              icon: icons[index % icons.length],
              title: p.title,
              description: p.writeup,
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
  );
};

export default Insights;
