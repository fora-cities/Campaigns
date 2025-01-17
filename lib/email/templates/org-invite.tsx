import {
  Tailwind,
  Button,
  Html,
  Head,
  Preview,
  Body,
  Container,
  Img,
  Text,
  Section,
  Hr,
  Link,
} from "@react-email/components";
import { render } from "@react-email/render";
import { brand } from "@/lib/constants";
import { Invite, Organization, Role, User } from "@prisma/client";
import { Resend } from "resend";
import EmailFooter from "../email-footer";
const resend = new Resend(process.env.RESEND_API_KEY as string);

type OrgInviteEmailProps = {
  inviter: User;
  org: Organization;
  role: Role;
  invite: Invite;
  url: string;
};

export function getArticle(name: string): string {
  const vowels = ["a", "e", "i", "o", "u"];
  return vowels.includes(name[0].toLowerCase()) ? "an" : "a";
}

function generateEmailHeader(
  invitingUser: User,
  organization: Organization,
  role: Role,
): JSX.Element {
  let headerText = "";
  if (invitingUser.name && invitingUser.name.length > 0) {
    const firstName = invitingUser.name.split(" ")[0];
    headerText = `${firstName} invited you to join ${
      organization.name
    } as ${getArticle(role.name)} ${role.name}`;
  } else {
    headerText = `${organization.name} invites you to join as ${getArticle(
      role.name,
    )} ${role.name}`;
  }

  return <Text className="text-xl font-bold text-gray-800">{headerText}</Text>;
}

function generateInviteSubjectLine(
  invitingUser: User,
  organization: Organization,
  role: Role,
): string {
  let subjectLine = "";
  if (invitingUser.name && invitingUser.name.length > 0) {
    const firstName = invitingUser.name.split(" ")[0];
    subjectLine = `${firstName} invited you to join ${organization.name} on Fora.`;
  } else {
    subjectLine = `${organization.name} invited you to join on Fora.`;
  }
  return subjectLine;
}

export const sendOrgInviteEmail = (props: OrgInviteEmailProps) => {
  return resend.emails.send({
    from: "Fora <no-reply@mail.fora.city>",
    to: [props.invite.email],
    subject: generateInviteSubjectLine(props.inviter, props.org, props.role),
    html: render(<OrgInviteEmail {...props} />, {
      pretty: true,
    }),
  });
};

export const OrgInviteEmail = ({
  inviter,
  org,
  role,
  url,
}: OrgInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{generateInviteSubjectLine(inviter, org, role)}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand,
                gray: brand.gray,
              },
            },
          },
        }}
      >
        <Body className={"font-sans"}>
          <Container className="mx-auto flex justify-center rounded bg-gray-100 px-16 pb-12 pt-10">
            <Img
              src={org.logo ? org.logo : `https://app.fora.city/fora-logo.png`}
              width="80"
              height="80"
              alt="Fora Logo"
              className={"rounded-full"}
            />
            <Text className="font-serif text-2xl font-bold text-gray-800">
              Join {org.name}
            </Text>

            <Section>
              {inviter.image ? (
                <Img
                  src={inviter.image}
                  width="80"
                  height="80"
                  alt={`Image of ${inviter.name}`}
                  className={"rounded-full"}
                />
              ) : null}
              <Text className="text-md text-gray-800">
                {generateInviteSubjectLine(inviter, org, role)}
              </Text>
            </Section>
            <Section className="py-5">
              <Link
                href={url}
                className="h-10 cursor-pointer rounded-full bg-brand-blue px-6 py-3 font-semibold text-gray-200"
              >
                {`Accept Invite`}
              </Link>
            </Section>
            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
