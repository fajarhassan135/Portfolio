"use client";

import Image from "next/image";
import type { Shot } from "@/app/projects/projects";

/**
 * Frames from a project's real interface, stacked down the right of the projected trailer.
 *
 * NO ENTRANCE OF ITS OWN. The frames fade in with the block around them and then hold still. An
 * earlier version scattered them at angles and revealed them one at a time; it fought the copy
 * beside it for attention and the screen only has so much room to be busy in.
 *
 * CAPPED AT THREE. The column divides its height evenly between however many frames it is given, so
 * five would each get a strip about 80px tall on a 1440 wide window, which is a contact sheet rather
 * than a look at the work. Three is the most that stays legible; the rest of the interface is one
 * click away on the live site.
 *
 * WHY next/image. The source captures are full browser grabs, around 3.8MB across the set, and they
 * render here a few hundred pixels wide. next/image resizes and re-encodes per breakpoint so the
 * page ships a fraction of that. It needs each file's intrinsic size, which is why Shot carries w
 * and h.
 *
 * ONLY THE VISIBLE PROJECT LOADS ITS FRAMES. Every project block stays mounted so it has something
 * to fade, which meant all thirteen images were requested at once; the optimiser had to run that
 * many resizes in parallel and some requests simply never came back, leaving two Nuvia frames blank.
 * The container still holds its space when idle, so nothing shifts when the frames arrive. */

const MAX_FRAMES = 3;

export default function ShotCluster({ shots, active }: { shots: Shot[]; active: boolean }) {
  if (!shots.length) return null;

  return (
    <div className="shot-stack">
      {shots.slice(0, MAX_FRAMES).map((s) => (
        <div className="shot-frame" key={s.src}>
          {active && (
            <Image
              src={s.src}
              alt={s.alt}
              width={s.w}
              height={s.h}
              sizes="(max-width: 900px) 40vw, 320px"
              /* the block it lives in is on screen, so there is nothing to defer */
              loading="eager"
            />
          )}
        </div>
      ))}
    </div>
  );
}
