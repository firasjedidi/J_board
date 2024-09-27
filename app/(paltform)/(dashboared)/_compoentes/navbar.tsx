import { Plus } from "lucide-react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { MobileSideBar } from "./mobile-sidebar";
import { FormPopover } from "@/components/form/form-popover";
export const Navbar = () => {
  return (
    <nav className="fixed z-50 top-0 px-2 md:px-4 w-full h-14 border-b shadow-sm bg-white flex items-center">
      <div className="flex items-center gap-x-1 md:gap-x-4">
        <MobileSideBar />
        <div className="hidden md:flex">
          <Logo />
        </div>
        <FormPopover align="start" sideOffset={18}>
          <Button
            size="sm"
            variant="primary"
            className="rounded-sm hidden md:block h-auto py-1.5 px-2 text-white"
          >
            Create
          </Button>
        </FormPopover>
        <FormPopover>
          <Button
            size="sm"
            variant="primary"
            className="rounded-sm block md:hidden text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </FormPopover>
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <div className="block md:hidden">
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/organization/:id"
            afterLeaveOrganizationUrl="/select-org"
            afterSelectOrganizationUrl="/organization/:id"
            appearance={{
              elements: {
                rootBox: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
              },
            }}
          />
        </div>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: {
                height: 30,
                width: 30,
              },
            },
          }}
        />
      </div>
    </nav>
  );
};
