import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface InviteLinkProps {
  inviteLink: string;
  copied: boolean;
  onCopy: () => void;
}

const InviteLink: React.FC<InviteLinkProps> = ({ inviteLink, copied, onCopy }) => {
  return (
    <div className="w-full max-w-xl bg-card p-4 rounded-lg shadow mb-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="flex-1 px-3 py-2 rounded bg-muted text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onCopy}
          className="shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default InviteLink;