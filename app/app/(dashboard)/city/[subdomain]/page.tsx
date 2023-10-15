import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Posts from "@/components/posts";
import CreatePostButton from "@/components/create-post-button";

export default async function SitePosts({
  params,
}: {
  params: { subdomain: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.organization.findUnique({
    where: {
      // id: params.id,
      subdomain: params.subdomain,
    },
  });

  console.log("City: ", data);

  if (!data) {
    notFound();
  }

  const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            All Docs for {data.name}
          </h1>
          <a
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${url}`
                : `http://${data.subdomain}.localhost:3000`
            }
            target="_blank"
            rel="noreferrer"
            className="truncate rounded-md bg-brand-gray100 px-2 py-1 text-sm font-medium text-brand-gray600 transition-colors hover:bg-brand-gray200 dark:bg-brand-gray800 dark:text-brand-gray400 dark:hover:bg-brand-gray700"
          >
            {url} ↗
          </a>
        </div>
        <CreatePostButton />
      </div>
      <Posts organizationId={params.subdomain} />
    </>
  );
}
