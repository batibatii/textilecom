"use client";

import { cn } from "@/lib/utils";

export type ProfileSection = "personal-info" | "password" | "favorites";

interface ProfileSubNavProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
}

export function ProfileSubNav({
  activeSection,
  onSectionChange,
}: ProfileSubNavProps) {
  const sections: { id: ProfileSection; label: string }[] = [
    { id: "personal-info", label: "Personal Info" },
    { id: "password", label: "Password" },
    { id: "favorites", label: "Favorites" },
  ];

  return (
    <nav className="flex gap-2 md:gap-3 justify-end flex-wrap">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={cn(
            "px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-light transition-colors cursor-pointer mt-1.5",
            activeSection === section.id
              ? "font-normal border-b-2 border-foreground "
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
