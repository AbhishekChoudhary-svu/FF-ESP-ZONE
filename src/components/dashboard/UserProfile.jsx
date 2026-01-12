"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditProfileForm } from "@/components/forms/EditProfile";
import MyContext from "@/context/ThemeProvider";

export function UserProfile() {
  const context = useContext(MyContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 p-8 backdrop-blur-md">
        <div className="flex justify-between items-start gap-6">
          {/* LEFT */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {context?.user?.username?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                {/* Username + Provider */}
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold">
                    {context?.user?.username}
                  </h2>

                  {/* Provider */}
                  {context?.user?.provider === "google" ? (
                    <img src="/google.svg" alt="Google" className="w-6 h-6" />
                  ) : (
                    <img src="/gmail.svg" alt="Google" className="w-6 h-6" />
                  )}
                </div>

                {/* UID */}
                <p className="text-foreground/70 mb-3">
                  Free Fire UID:{" "}
                  <span className="font-medium">{context?.user?.ffUid}</span>
                </p>

                {/* Bio */}
                {context?.user?.bio && (
                  <p className="text-sm text-foreground/70 mt-4 italic max-w-xl">
                    “{context?.user.bio}”
                  </p>
                )}
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-foreground/60">Rank</p>
                <p className="text-lg font-semibold">{context?.user?.rank}</p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Playstyle</p>
                <p className="text-lg font-semibold">
                  {context?.user?.playstyle}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Tournaments</p>
                <p className="text-lg font-semibold">
                  {context?.user?.tournamentsJoined}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Plans</p>
                <p className="text-lg font-semibold">
                  {context?.user?.plan?.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">User's Type</p>
                <p className="text-lg font-semibold">
                  {context?.user?.role === "user" ? "Player" : "Moderator"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Edit Profile</Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>

              <EditProfileForm
                user={context?.user}
                onClose={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </>
  );
}
