"use client";
import HomeNav      from "../components/home/HomeNav";
import HeroSection  from "../components/home/HeroSection";
import FeatureCards from "../components/home/FeatureCards";
import DebatePreview from "../components/home/DebatePreview";
import HomeFooter   from "../components/home/HomeFooter";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(160deg, #0d0626 0%, #1a0a40 55%, #0d0626 100%)", fontFamily: "'Impact','Arial Black',sans-serif" }}>
      <HomeNav />
      <main style={{ flex: 1 }}>
        <HeroSection />
        <FeatureCards />
        <DebatePreview />
      </main>
      <HomeFooter />
    </div>
  );
}