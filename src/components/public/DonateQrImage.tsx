"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface DonateQrImageProps {
  src: string;
  alt: string;
}

export default function DonateQrImage({ src, alt }: DonateQrImageProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt}
        title={locale === "km" ? "ចុចដើម្បីពង្រីក" : "Click to enlarge"}
        className="block cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-48 h-48 mx-auto rounded-xl object-contain mb-4 transition-transform duration-200 hover:scale-[1.03]"
        />
      </button>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src, alt }]}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
        zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
      />
    </>
  );
}
