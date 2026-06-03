

import { DarkDialog, labelCls } from "../shared/primitives"

export function ViewClipsDialog({ open, onOpenChange, player }) {
  const hasPhotos = player?.clipPhotos?.length > 0
  const hasVideo  = Boolean(player?.clipVideo)

  return (
    <DarkDialog
      open={open}
      onOpenChange={onOpenChange}
      title={player ? `${player.userId?.username} — Clips` : "Clips"}
    >
      {player ? (
        <div className="space-y-4">

          {hasPhotos && (
            <div>
              <span className={labelCls}>Photo Clips</span>
              <div className="grid grid-cols-2 gap-2">
                {player.clipPhotos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Clip ${i + 1}`}
                    className="h-40 w-full rounded-lg object-cover border border-[#2a2e3a]"
                  />
                ))}
              </div>
            </div>
          )}

          {hasVideo && (
            <div>
              <span className={labelCls}>Video Clip</span>
              <video
                src={player.clipVideo}
                controls
                className="w-full h-[28vh] rounded-lg border border-[#2a2e3a]"
              />
            </div>
          )}

          {!hasPhotos && !hasVideo && (
            <p className="text-center text-[#4a5060] py-4">No clips uploaded yet</p>
          )}
        </div>
      ) : (
        <p className="text-center text-[#4a5060] py-4">No player profile found</p>
      )}
    </DarkDialog>
  )
}