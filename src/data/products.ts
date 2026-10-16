import type { ImageMetadata } from "astro";
import desk from "../assets/images/regudesk-cutout.png";
import step from "../assets/images/regustep-cutout.png";
import board from "../assets/images/writing-board-cutout.png";

/** Outline icons drawn inline by ProductStory.astro (Lucide-style). */
export type ProductIcon = "hand" | "footprints" | "pencil" | "pointer";

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
  /** Shown in the visual panel whenever there is no `visual`. */
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
    cta: "Ask about ReguDesk",
    visual: {
      src: desk,
      alt: "CAD render of ReguDesk, a grey desk-mounted unit with a slider, dials and tactile controls.",
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
    cta: "Ask about ReguStep",
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
    cta: "Ask about the writing board",
    pressureGuide: true,
    visual: {
      src: board,
      alt: "CAD render of the Writing Pressure Board: a white writing surface with green corner pads, a pencil and a wrist support, shown with a hand writing.",
    },
    placeholderLabel: "Interactive demonstration — asset to follow",
  },
  {
    id: "pinch",
    name: "Pinch Node",
    category: "Fingers",
    question: "What if small movements had somewhere purposeful to go?",
    icon: "pointer",
    tagline: "Small movements. Thoughtful design.",
    description:
      "A concept exploring finger movement and guided activity. Further details will follow as the mechanical design progresses.",
    cta: "Keep me updated",
    placeholderLabel: "3D concept — asset to follow",
  },
];
