"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileSubNav, ProfileSection } from "@/components/layout/ProfileSubNav";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { ChangePassword } from "@/components/profile/ChangePassword";
import { Favorites } from "@/components/profile/Favorites";
import type { User } from "@/contexts/AuthContext";

interface ProfileContainerProps {
  user: User;
}

export function ProfileContainer({ user }: ProfileContainerProps) {
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal-info");

  const renderContent = () => {
    switch (activeSection) {
      case "personal-info":
        return <PersonalInfo user={user} />;
      case "password":
        return <ChangePassword />;
      case "favorites":
        return <Favorites user={user} />;
    }
  };

  const innerCard = (
    <Card
      className={`h-fit  ${
        activeSection === "favorites"
          ? "w-full sm:w-200 md:w-250 lg:w-300 border-none shadow-none"
          : "min-w-90 xs:w-147 sm:w-150 md:w-200 border shadow-sm"
      }`}
    >
      <CardContent className="p-3 md:p-6">{renderContent()}</CardContent>
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
