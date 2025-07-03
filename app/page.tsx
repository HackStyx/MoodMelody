"use client";
import { HeroSection } from "@/components/blocks/hero-section-1";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return <HeroSection />;
}
