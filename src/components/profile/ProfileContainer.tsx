"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  ProfileSubNav,
  ProfileSection,
} from "@/components/layout/ProfileSubNav";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { ChangePassword } from "@/components/profile/ChangePassword";
import { Favorites } from "@/components/profile/Favorites";
import { OrderHistory } from "@/components/profile/OrderHistory";
import type { User } from "@/contexts/AuthContext";

interface ProfileContainerProps {
  user: User;
}

export function ProfileContainer({ user }: ProfileContainerProps) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section") as ProfileSection | null;

  const [activeSection, setActiveSection] =
    useState<ProfileSection>(sectionParam || "personal-info");

  // Update active section when URL changes
  useEffect(() => {
    if (sectionParam && ["personal-info", "password", "favorites", "orders"].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  const renderContent = () => {
    switch (activeSection) {
      case "personal-info":
        return <PersonalInfo user={user} />;
      case "password":
        return <ChangePassword />;
      case "favorites":
        return <Favorites user={user} />;
      case "orders":
        return <OrderHistory />;
    }
  };

  const innerCard = (
    <Card
      className={`h-fit  ${
        activeSection === "favorites" || activeSection === "orders"
          ? "w-full sm:w-200 md:w-250 lg:w-300 border-none shadow-none"
          : "min-w-90 xs:w-147 sm:w-150 md:w-200 border shadow-sm"
      }`}
    >
      <CardContent className={activeSection === "orders" ? "p-4 md:p-6" : "p-3 md:p-6"}>
        {renderContent()}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="xl:hidden w-full max-w-200">
        <div className="flex justify-end mb-3">
          <ProfileSubNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>
        {innerCard}
      </div>

      <div className="hidden xl:block relative">
        <div className="absolute -top-10 right-0">
          <ProfileSubNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>
        <Card className="border h-250 w-450 flex justify-center items-center shadow-md">
          {innerCard}
        </Card>
      </div>
    </>
  );
}
