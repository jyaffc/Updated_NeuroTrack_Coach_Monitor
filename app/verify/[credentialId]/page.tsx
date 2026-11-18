import { PublicCredentialView } from "@/components/public-credential-view";

export default async function VerifyCredentialPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;

  return <PublicCredentialView credentialId={credentialId} />;
}
