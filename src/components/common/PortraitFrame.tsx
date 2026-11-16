import { cn } from "@/lib/utils";

export type FrameImage = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
};

/** An illustration presented in a small "window" frame. */
export default function PortraitFrame({
  image,
  caption = "workspace.png",
  className,
  imgClassName,
  eager = false,
}: {
  image: FrameImage;
  caption?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  return (
    <figure className={cn("overflow-hidden border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <figcaption className="font-mono text-xs text-muted-foreground">~/{caption}</figcaption>
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2 w-2 bg-border" />
          <span className="h-2 w-2 bg-border" />
          <span className="h-2 w-2 bg-primary" />
        </span>
      </div>
      <div className="bg-white">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={cn("h-auto w-full object-cover", imgClassName)}
        />
      </div>
    </figure>
  );
}
