import { notFound } from "next/navigation";
import { getPostData } from "@/lib/fetchers";
import BlogCard from "@/components/blog-card";
import BlurImage from "@/components/blur-image";
import MDX from "@/components/mdx";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import { User } from "@prisma/client";

export async function generateMetadata({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const { slug } = params;
  const domain = params.domain.replace("%3A", ":");
  const data = await getPostData(domain, slug);
  if (!data) {
    return null;
  }
  const { title, description } = data;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@vercel",
    },
  };
}

const selectAuthorUsername = (user: User) => {
  if (user?.username) return user.username;
  if (user?.gh_username) return user.gh_username;
  if (user?.ens_name) return user.ens_name;
  if (user?.eth_address) return user.eth_address;
};


export default async function OrganizationDocPage({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const domain = params.domain.replace("%3A", ":");
  const { slug } = params;
  const data = await getPostData(domain, slug);

  console.log("data: ", data);

  if (!data) {
    notFound();
  }

  if (!data.user) {
    notFound();
  }


  const authorUsername = selectAuthorUsername(data.user);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center md:w-7/12">
          <p className="text-brand-gray500 m-auto my-5 w-10/12 text-sm font-light dark:text-brand-gray400 md:text-base">
            {toDateString(data.createdAt)}
          </p>
          <h1 className="mb-10 font-title text-3xl font-bold text-brand-gray800 dark:text-white md:text-6xl">
            {data.title}
          </h1>
          <p className="text-md m-auto w-10/12 text-brand-gray600 dark:text-brand-gray400 md:text-lg">
            {data.description}
          </p>
        </div>
        <a
          // if you are using Github OAuth, you can get rid of the Twitter option
          href={
            data.user?.username
              ? `https://twitter.com/${data.user.username}`
              : `https://github.com/${data.user?.gh_username}`
          }
          rel="noreferrer"
          target="_blank"
        >
          <div className="my-8">
            <div className="relative inline-block h-8 w-8 overflow-hidden rounded-full align-middle md:h-12 md:w-12">
              {data.user?.image ? (
                <BlurImage
                  alt={data.user?.name ?? "User Avatar"}
                  height={80}
                  src={data.user.image}
                  width={80}
                />
              ) : (
                <div className="text-brand-gray500 absolute flex h-full w-full select-none items-center justify-center bg-brand-gray100 text-4xl">
                  ?
                </div>
              )}
            </div>
            <div className="text-md ml-3 inline-block align-middle dark:text-white md:text-lg">
              by <span className="font-semibold">{authorUsername}</span>
            </div>
          </div>
        </a>
      </div>
      <div className="relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-150 md:w-5/6 md:rounded-2xl lg:w-2/3">
        <BlurImage
          alt={data.title ?? "Post image"}
          width={1200}
          height={630}
          className="h-full w-full object-cover"
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
          src={data.image ?? "/placeholder.png"}
        />
      </div>

      <MDX source={data.mdxSource} />

      {data.adjacentPosts.length > 0 && (
        <div className="relative mb-20 mt-10 sm:mt-20">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-brand-gray300 dark:border-brand-gray700" />
          </div>
          <div className="relative flex justify-center">
            <span className="text-brand-gray500 bg-white px-2 text-sm dark:bg-brand-gray900 dark:text-brand-gray400">
              Continue Reading
            </span>
          </div>
        </div>
      )}
      {data.adjacentPosts && (
        <div className="mx-5 mb-20 grid max-w-screen-xl grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:mx-auto xl:grid-cols-3">
          {data.adjacentPosts.map((data, index) => (
            <BlogCard key={index} data={data} />
          ))}
        </div>
      )}
    </>
  );
}
