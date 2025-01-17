import prisma from "@/lib/prisma";
import Form from "@/components/form";
import { updateOrganization } from "@/lib/actions";

export default async function SiteSettingsDomains({
  params,
}: {
  params: { subdomain: string };
}) {
  const data = await prisma.organization.findUnique({
    where: {
      subdomain: params.subdomain,
    },
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Subdomain"
        description=""
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "subdomain",
          type: "text",
          defaultValue: data?.subdomain!,
          placeholder: "subdomain",
          maxLength: 32,
        }}
        handleSubmit={updateOrganization}
      />
      {/* <Form
        title="Custom Domain"
        description="The custom domain for your site."
        helpText="Please enter a valid domain."
        inputAttrs={{
          name: "customDomain",
          type: "text",
          defaultValue: data?.customDomain!,
          placeholder: "yourdomain.com",
          maxLength: 64,
          pattern: "^[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}$",
        }}
        handleSubmit={updateOrganization}
      /> */}
    </div>
  );
}
