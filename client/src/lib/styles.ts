import { cva } from "class-variance-authority";

// Glass panel variants
export const glassPanel = cva("backdrop-blur-md border rounded-lg", {
  variants: {
    variant: {
      default: "bg-black/20 border-white/10",
      strong: "bg-black/40 border-white/20",
      accent: "bg-purple-500/10 border-purple-400/20",
      success: "bg-emerald-500/10 border-emerald-400/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Tile (letter) variants for Wordle
export const tileVariants = cva(
  "w-12 h-12 flex items-center justify-center font-bold text-white text-lg rounded-lg border-2 transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm",
  {
    variants: {
      state: {
        correct: "bg-emerald-600 border-emerald-500 shadow-emerald-500/25",
        present: "bg-amber-500 border-amber-400 shadow-amber-500/25",
        absent: "bg-slate-600 border-slate-500 shadow-slate-500/25",
      },
    },
    defaultVariants: {
      state: "absent",
    },
  }
);

// Avatar variants
export const avatarVariants = cva("rounded-full object-cover", {
  variants: {
    size: {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-16 h-16",
    },
    border: {
      none: "",
      subtle: "border-2 border-white/20",
      accent: "border-2 border-purple-400/30",
      winner: "border-4 border-yellow-300/70",
    },
  },
  defaultVariants: {
    size: "md",
    border: "subtle",
  },
});

// Score item variants
export const scoreItemVariants = cva(
  "flex items-center justify-between p-4 rounded-xl transition-all duration-300 group hover:scale-105 transform",
  {
    variants: {
      rank: {
        winner: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-emerald-500/20 animate-pulse-win",
        top: "border border-yellow-400/20 hover:bg-white/5",
        normal: "hover:bg-white/5",
      },
      panel: {
        glass: "bg-black/20 backdrop-blur-md border border-white/10",
      },
    },
    compoundVariants: [
      {
        rank: "top",
        panel: "glass",
        className: "bg-black/20 backdrop-blur-md border border-yellow-400/20",
      },
      {
        rank: "normal", 
        panel: "glass",
        className: "bg-black/20 backdrop-blur-md border border-white/10",
      },
    ],
    defaultVariants: {
      rank: "normal",
      panel: "glass",
    },
  }
);

// Badge variants for scores
export const scoreBadgeVariants = cva("px-3 py-1 rounded-full text-sm font-bold border", {
  variants: {
    variant: {
      winner: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30",
      top: "bg-yellow-500/20 text-yellow-100 border-yellow-400/30", 
      normal: "bg-purple-500/20 text-purple-100 border-purple-400/30",
    },
  },
  defaultVariants: {
    variant: "normal",
  },
});

// Card header variants
export const cardHeaderVariants = cva("p-6", {
  variants: {
    spacing: {
      tight: "pb-2",
      normal: "pb-4",
      loose: "pb-6",
    },
  },
  defaultVariants: {
    spacing: "normal",
  },
});

// Guess item variants
export const guessItemVariants = cva(
  "group p-4 rounded-lg transition-all duration-300 animate-slide-in",
  {
    variants: {
      variant: {
        default: "bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Icon container variants
export const iconContainerVariants = cva("p-2 rounded-lg", {
  variants: {
    variant: {
      primary: "bg-gradient-to-r from-purple-600 to-pink-600",
      success: "bg-gradient-to-r from-emerald-600 to-teal-600",
      warning: "bg-gradient-to-r from-amber-600 to-orange-600",
      winner: "bg-emerald-500/20",
      top: "bg-yellow-500/20",
      normal: "bg-purple-500/20",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});