import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";

export const theme2Serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-theme2-serif",
});

export const theme2Sans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-theme2-sans",
});
