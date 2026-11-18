"use client";

import { useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";

type CredentialActionsProps = {
  credentialName: string;
  organization: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
};

export function CredentialActions({
  credentialName,
  organization,
  issueDate,
  credentialId,
  credentialUrl,
}: CredentialActionsProps) {
  const [copied, setCopied] = useState(false);

  const linkedInPayload = [
    `Credential name: ${credentialName}`,
    `Issuing organization: ${organization}`,
    `Issue date: ${issueDate}`,
    `Credential ID: ${credentialId}`,
    `Credential URL: ${credentialUrl}`,
  ].join("\n");

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <button
        type="button"
        onClick={() => copyText(linkedInPayload)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100"
      >
        <Share2 className="h-4 w-4" />
        {copied ? "LinkedIn fields copied" : "Copy LinkedIn fields"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/82"
      >
        <Download className="h-4 w-4" />
        Print certificate
      </button>
      <button
        type="button"
        onClick={() => copyText(credentialUrl)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/82"
      >
        <Copy className="h-4 w-4" />
        Copy verification URL
      </button>
    </div>
  );
}
