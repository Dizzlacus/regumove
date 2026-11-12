import type { ImageMetadata } from "astro";
import deskCutout1 from "../assets/images/regudesk-1-cutout.png";
import deskCutout2 from "../assets/images/regudesk-2-cutout.png";
import deskCutout3 from "../assets/images/regudesk-3-cutout.png";
import deskCutout4 from "../assets/images/regudesk-4-cutout.png";
import deskCutout5 from "../assets/images/regudesk-5-cutout.png";
import deskVideoPoster from "../assets/images/regudesk-video-poster.jpg";
import step from "../assets/images/regustep-cutout.png";
import board from "../assets/images/writing-board-cutout.png";

/** Outline icons drawn inline by ProductStory.astro (Lucide-style). */
export type ProductIcon = "hand" | "footprints" | "pencil" | "pointer";

/**
 * One slide of a product gallery (ProductGallery.astro). Images go through astro:assets;
 * a video is served as-is from public/ (path is root-relative, prefixed with the base at render).
 */
export type GallerySlide =
  | {
      kind: "image";
      src: ImageMetadata;
      alt: string;
      /** Transparent cutout: inset and contained. Otherwise a photo that fills the frame. */
      cutout?: boolean;
    }
  | {
      kind: "video";
      /** Root-relative path under public/, e.g. "/media/clip.mp4". */
      src: string;
      type: string;
      poster: ImageMetadata;
      /** Accessible name for the slide and the video. */
      label: string;
    };

export interface Product {
  /** Anchor for the row: #product-{id} */
  id: string;
  name: string;
  /** Short theme shown in the row label, e.g. "01 / Hands". */
  category: string;
  /** Opening question, shown above the icon (a paragraph, not a heading). */
  question: string;
  icon: ProductIcon;
  tagline: string;
  description: string;
  /** Label for the pill button; every button links to #contact. */
  cta: string;
  /** Shows the static Light → Heavy guide under the description. Decorative, not interactive. */
  pressureGuide?: boolean;
  /** Real render, if supplied (transparent cutout, shown with object-fit: contain). */
  visual?: {
    src: ImageMetadata;
    alt: string;
  };
  /** Slideshow shown instead of `visual` when present. */
  gallery?: {
    /** Accessible name for the carousel region. */
    label: string;
    slides: GallerySlide[];
  };
  /** Shown in the visual panel whenever there is neither `gallery` nor `visual`. */
  placeholderLabel: string;
}

export const products: Product[] = [
  {
    id: "regudesk",
    name: "ReguDesk",
    category: "Hands",
    question: "What if a busy hand had somewhere to go?",
    icon: "hand",
    tagline: "Give busy hands somewhere to go.",
    description:
      "A desk-mounted design bringing tactile activities within reach. With features to slide, turn and roll, ReguDesk explores how hand movement can be accommodated at the desk.",
    cta: "Enquire now",
    gallery: {
      label: "ReguDesk photos and video",
      slides: [
        {
          kind: "image",
          src: deskCutout3,
          cutout: true,
          alt: "ReguDesk from above: a raised-dot strip, a slider, mint and white keys, a white trackball, a dial and a knurled roller.",
        },
        {
          kind: "image",
          src: deskCutout1,
          cutout: true,
          alt: "ReguDesk from the back: two suction-cup mounts beneath a ledge embossed with the ReguMove logo.",
        },
        {
          kind: "image",
          src: deskCutout2,
          cutout: true,
          alt: "ReguDesk from the side, with its keys, trackball and dial along the front edge.",
        },
        {
          kind: "image",
          src: deskCutout4,
          cutout: true,
          alt: "ReguDesk standing upright, with the ReguMove logo on top and its tactile controls on the front.",
        },
        {
          kind: "image",
          src: deskCutout5,
          cutout: true,
          alt: "ReguDesk from above at an angle, showing the keys, trackball, dial, roller and slider in a row.",
        },
        {
          kind: "video",
          src: "/media/regudesk-demo.mp4",
          type: "video/mp4",
          poster: deskVideoPoster,
          label:
            "Video: ReguDesk mounted under the edge of a desk, as a hand presses the keys, rolls the trackball and turns the roller.",
        },
      ],
    },
    placeholderLabel: "Large product visual — CAD render to follow",
  },
  {
    id: "regustep",
    name: "ReguStep",
    category: "Feet",
    question: "What if movement could happen without leaving the desk?",
    icon: "footprints",
    tagline: "Make room for movement under the desk.",
    description:
      "A twin-pedal design for resisted foot movement while seated. ReguStep brings a practical movement option into the space beneath the desk.",
    cta: "Enquire now",
    visual: {
      src: step,
      alt: "CAD render of ReguStep, a low base with two green textured foot pedals.",
    },
    placeholderLabel: "Product animation — asset to follow",
  },
  {
    id: "writing-board",
    name: "Writing Pressure Board",
    category: "Pressure",
    question: "What if “press lighter” could be something you could see?",
    icon: "pencil",
    tagline: "Make “a little lighter” easier to understand.",
    description:
      "A writing surface designed to turn pencil pressure into visible feedback, giving the instruction to press more lightly—or more firmly—a reference the child can see.",
    cta: "Enquire now",
    pressureGuide: true,
    visual: {
      src: board,
      alt: "CAD render of the Writing Pressure Board: a white writing surface with green corner pads, a pencil and a wrist support, shown with a hand writing.",
    },
    placeholderLabel: "Interactive demonstration — asset to follow",
  },
  // ReguPinch hidden for now — uncomment to restore.
  // {
  //   id: "pinch",
  //   name: "ReguPinch",
  //   category: "Fingers",
  //   question: "What if small movements had somewhere purposeful to go?",
  //   icon: "pointer",
  //   tagline:
  //     "A hands-on writing intervention tool designed to support fine motor skills, hand control and the foundations of handwriting.",
  //   description:
  //     "Users gently pinch the stylus between their thumb and index finger to extend its tip, then guide a small token along a letter, shape or patterned path. This combines controlled finger pressure with guided movement, offering a purposeful, tactile way to practise skills used in writing.",
  //   cta: "Enquire now",
  //   placeholderLabel: "3D concept — asset to follow",
  // },
];
