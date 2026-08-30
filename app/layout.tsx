import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title:"BEENIMC | Texturas Minecraft", description:"Texturas selecionadas para Minecraft." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
