import Link from "next/link";
import { notFound } from "next/navigation";
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import BlogCard from "@/components/blog-card";
import { getPostsForOrganization, getSiteData } from "@/lib/fetchers";
import Image from "next/image";
import { getSession } from "@/lib/auth";

export default async function SiteHomePage({
  params,
}: {
  params: { domain: string };
}) {
  // domain = domain.replace('%3A', ':');
  const domain = params.domain.replace('%3A', ':');
  const session = await getSession();
  console.log("domain session: ", session);
  const sitedata = await getSiteData(domain);
  const [data, posts] = await Promise.all([
    getSiteData(domain),
    getPostsForOrganization(domain),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className="mb-20 w-full">
        {posts.length > 0 ? (
          <div className="mx-auto w-full max-w-screen-xl md:mb-28 lg:w-5/6">
            <Link href={`/${posts[0].slug}`}>
              <div className="group relative mx-auto h-80 w-full overflow-hidden sm:h-150 lg:rounded-xl">
                <BlurImage
                  alt={posts[0].title ?? ""}
                  blurDataURL={posts[0].imageBlurhash ?? placeholderBlurhash}
                  className="h-full w-full object-cover group-hover:scale-105 group-hover:duration-300"
                  width={1300}
                  height={630}
                  placeholder="blur"
                  src={posts[0].image ?? "/placeholder.png"}
                />
              </div>
              <div className="mx-auto mt-10 w-5/6 lg:w-full">
                <h2 className="my-10 font-title text-4xl dark:text-white md:text-6xl">
                  {posts[0].title}
                </h2>
                <p className="w-full text-base dark:text-white md:text-lg lg:w-2/3">
                  {posts[0].description}
                </p>
                <div className="flex w-full items-center justify-start space-x-4">
                  <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">
                    {data.user?.image ? (
                      <BlurImage
                        alt={data.user?.name ?? "User Avatar"}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                        src={data.user?.image}
                      />
                    ) : (
                      <div className="absolute flex h-full w-full select-none items-center justify-center bg-brand-gray100 text-4xl text-brand-gray500">
                        ?
                      </div>
                    )}
                  </div>
                  <p className="ml-3 inline-block whitespace-nowrap align-middle text-sm font-semibold dark:text-white md:text-base">
                    {data.user?.name}
                  </p>
                  <div className="h-6 border-l border-brand-gray600 dark:border-brand-gray400" />
                  <p className="m-auto my-5 w-10/12 text-sm font-light text-brand-gray500 dark:text-brand-gray400 md:text-base">
                    {toDateString(posts[0].createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Image
              alt="missing post"
              src="https://illustrations.popsy.co/gray/success.svg"
              width={400}
              height={400}
              className="dark:hidden"
            />
            <Image
              alt="missing post"
              src="https://illustrations.popsy.co/white/success.svg"
              width={400}
              height={400}
              className="hidden dark:block"
            />
            <p className="font-title text-2xl text-brand-gray600 dark:text-brand-gray400">
              No posts yet.
            </p>
          </div>
        )}
      </div>

      {posts.length > 1 && (
        <div className="mx-5 mb-20 max-w-screen-xl lg:mx-24 2xl:mx-auto">
          <h2 className="mb-10 font-title text-4xl dark:text-white md:text-5xl">
            More stories
          </h2>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.slice(1).map((metadata, index) => (
              <BlogCard key={index} data={metadata} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
