import { Suspense } from "react";
import Organizations from "@/components/organizations";
import PlacholderCard from "@/components/placeholder-card";
import CreateOrganizationButton from "@/components/create-organization-button";
import CreateOrganizationModal from "@/components/modal/create-organization";
import NextFeaturedEvent from "@/components/next-featured-event";

export default function Overview() {
  return (
    <>
      <div className="h-6 md:h-6" />
      <div className="max-w-screen-3xl flex flex-col space-y-12">
        <div className="flex flex-col space-y-6 p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-cal text-3xl font-bold dark:text-white">
              My Organizations
            </h1>
            <CreateOrganizationButton>
              <CreateOrganizationModal />
            </CreateOrganizationButton>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PlacholderCard key={i} />
                ))}
              </div>
            }
          >
            <Organizations/>
          </Suspense>
        </div>
      </div>
    </>
  );
}
