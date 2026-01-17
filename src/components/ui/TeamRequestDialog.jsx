"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TeamRequestDialog({
  open,
  setOpen,
  request,
  onAccept,
  onReject,
  isCaptainView = false,
}) {
  if (!request) return null;

  const isAccepted = request.status === "accepted";
  const isRejected = request.status === "rejected";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Application</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {request.type === "invite"
              ? "Team Invitation"
              : "Join Team Request"}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          {/* Team / Player Info */}
          <div className="flex items-center gap-3">
            <img
              src={isCaptainView ? request.player?.avatar : request.team?.logo}
              className="w-14 h-14 rounded-full object-cover"
            />

            <div>
              <p className="font-semibold">
                {isCaptainView
                  ? request.player?.userId?.username
                  : request.team?.teamName}
              </p>

              <p className="text-xs text-muted-foreground">
                {isCaptainView ? request.player?.inGameRole : request.team?.tag}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            {isAccepted && (
              <Badge className="bg-green-600">✅ Request Accepted</Badge>
            )}

            {isRejected && (
              <Badge variant="destructive">❌ Request Rejected</Badge>
            )}

            {request.status === "pending" && (
              <Badge variant="outline">⏳ Pending</Badge>
            )}
          </div>

          {/* Actions */}
          {request.status === "pending" && (
            <div className="flex gap-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => onAccept(request._id)}
              >
                Accept
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => onReject(request._id)}
              >
                Reject
              </Button>
            </div>
          )}

          {/* Accepted Message for Player */}
          {isAccepted && !isCaptainView && (
            <p className="text-center text-green-600 font-semibold">
              🎉 Your request has been accepted! You are now part of the team.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
