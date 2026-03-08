import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Environment, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AlertCircle,
  Award,
  CheckCircle,
  ChevronDown,
  Diamond,
  Heart,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type * as THREE from "three";
import type { GoldPrice, Product } from "./backend.d";
import {
  useActiveProducts,
  useGoldPrices,
  useSubmitInquiry,
} from "./hooks/useQueries";

// --- CONSTANTS ---
const PHONE = "09815757180";
const WHATSAPP_BASE = "https://wa.me/919815757180";
const MAPS_LINK =
  "https://www.google.com/maps?q=Punjab+Jewellers,+Gol+Gappa+Chownk,+Patiala";
const ADDRESS = "GOL GAPPA CHOWNK, SCO 946, Tripuri, Patiala, Punjab 147004";

const CATEGORY_IMAGES: Record<string, string> = {
  Necklaces: "/assets/generated/necklace-hero.dim_800x800.jpg",
  Rings: "/assets/generated/diamond-ring.dim_800x800.jpg",
  Bridal: "/assets/generated/bridal-set.dim_800x800.jpg",
  Bangles: "/assets/generated/gold-bangles.dim_800x800.jpg",
  Earrings: "/assets/generated/gold-earrings.dim_800x800.jpg",
  "Wedding Sets": "/assets/generated/wedding-set.dim_800x800.jpg",
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Kundan Bridal Necklace",
    category: "Necklaces",
    price: 185000n,
    description:
      "Exquisite 22K gold kundan necklace with handcrafted floral motifs, perfect for bridal occasions.",
    tags: ["BESTSELLER", "BRIDAL"],
    isActive: true,
  },
  {
    id: 2n,
    name: "Solitaire Diamond Ring",
    category: "Rings",
    price: 95000n,
    description:
      "Certified 1-carat solitaire diamond set in 18K white gold, radiating brilliance and elegance.",
    tags: ["NEW"],
    isActive: true,
  },
  {
    id: 3n,
    name: "Maharani Bridal Set",
    category: "Bridal",
    price: 450000n,
    description:
      "Complete royal bridal jewellery set in 22K gold with polki diamonds and precious stones.",
    tags: ["BESTSELLER", "BRIDAL"],
    isActive: true,
  },
  {
    id: 4n,
    name: "Filigree Gold Bangles",
    category: "Bangles",
    price: 68000n,
    description:
      "Set of 4 delicate 22K gold filigree bangles with traditional Punjab craftsmanship.",
    tags: ["BESTSELLER"],
    isActive: true,
  },
  {
    id: 5n,
    name: "Jhumka Drop Earrings",
    category: "Earrings",
    price: 42000n,
    description:
      "Ornate 22K gold jhumka earrings with emerald drops and pearl accents.",
    tags: ["NEW"],
    isActive: true,
  },
  {
    id: 6n,
    name: "Heritage Wedding Set",
    category: "Wedding Sets",
    price: 320000n,
    description:
      "Premium 22K gold wedding set including necklace, earrings, maang tikka and bangles.",
    tags: ["BESTSELLER"],
    isActive: true,
  },
];

const FALLBACK_GOLD: GoldPrice[] = [
  { purity: "24K", pricePerGram: 7250n, lastUpdated: BigInt(Date.now()) },
  { purity: "22K", pricePerGram: 6680n, lastUpdated: BigInt(Date.now()) },
];

const CATEGORIES = [
  "All",
  "Necklaces",
  "Rings",
  "Bridal",
  "Bangles",
  "Earrings",
  "Wedding Sets",
];

// --- 3D JEWELRY COMPONENT (P0 fix: tighter camera, no Float fighting useFrame, stronger lighting) ---
function JewelryModel() {
  const knotRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Main knot: slow, majestic rotation
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.18;
      knotRef.current.rotation.y = t * 0.32;
    }
    // Orbiting ring 1
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.4;
      ring1Ref.current.rotation.z = t * 0.25;
      ring1Ref.current.position.x = Math.sin(t * 0.5) * 2.4;
      ring1Ref.current.position.y = Math.cos(t * 0.5) * 0.6;
    }
    // Orbiting ring 2
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.3;
      ring2Ref.current.rotation.z = t * 0.15;
      ring2Ref.current.position.x = Math.sin(t * 0.4 + 2.1) * 1.8;
      ring2Ref.current.position.y = Math.cos(t * 0.4 + 2.1) * 1.2;
    }
    // Glow sphere — breathe
    if (glowRef.current) {
      const breathe = 1 + Math.sin(t * 1.2) * 0.08;
      glowRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <>
      {/* Atmospheric ambient */}
      <ambientLight intensity={0.15} />
      {/* Primary gold key light — from upper left */}
      <pointLight
        position={[-4, 6, 4]}
        intensity={6}
        color="#D4AF37"
        distance={20}
        decay={2}
      />
      {/* Rim light from right — champagne */}
      <pointLight
        position={[6, 2, 3]}
        intensity={4}
        color="#F2D060"
        distance={18}
        decay={2}
      />
      {/* Fill from below — warm white */}
      <pointLight
        position={[0, -5, 4]}
        intensity={2.5}
        color="#fff8e7"
        distance={15}
        decay={2}
      />
      {/* Back light — cool highlight */}
      <pointLight
        position={[0, 3, -6]}
        intensity={1.5}
        color="#ffffff"
        distance={12}
        decay={2}
      />

      {/* Atmospheric glow sphere behind knot — gives bloom-like halo */}
      <mesh ref={glowRef} position={[1.2, 0, -1.5]} scale={2.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={0xd4af37} transparent opacity={0.04} />
      </mesh>

      {/* Main TorusKnot — richer geometry */}
      <mesh ref={knotRef} scale={2.0} position={[1, 0, 0]}>
        <torusKnotGeometry args={[1, 0.32, 300, 40, 2, 3]} />
        <meshStandardMaterial
          color={0xc9a227}
          metalness={1.0}
          roughness={0.04}
          envMapIntensity={3.5}
        />
      </mesh>

      {/* Orbiting ring 1 — thin champagne */}
      <mesh ref={ring1Ref} scale={0.55} position={[2.4, 0, 0]}>
        <torusGeometry args={[1, 0.14, 32, 128]} />
        <meshStandardMaterial
          color={0xf2d060}
          metalness={1}
          roughness={0.02}
          envMapIntensity={4}
        />
      </mesh>

      {/* Orbiting ring 2 — smaller, deep gold */}
      <mesh ref={ring2Ref} scale={0.38} position={[1.8, 1.2, 0]}>
        <torusGeometry args={[1, 0.18, 32, 80]} />
        <meshStandardMaterial
          color={0xd4af37}
          metalness={1}
          roughness={0.03}
          envMapIntensity={3.5}
        />
      </mesh>

      <Environment preset="studio" />
    </>
  );
}

// --- LOADING SCREEN ---
function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)",
              border: "1px solid rgba(212,175,55,0.4)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(212,175,55,0.2)",
                "0 0 50px rgba(212,175,55,0.5)",
                "0 0 20px rgba(212,175,55,0.2)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <span className="font-display text-4xl font-light shimmer-text">
              PJ
            </span>
          </motion.div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-xl font-light tracking-widest text-gold">
            PUNJAB JEWELLERS
          </p>
          <p
            className="font-body text-xs tracking-[0.3em] uppercase"
            style={{ color: "rgba(212,175,55,0.6)" }}
          >
            Timeless Luxury
          </p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#D4AF37" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- NAVIGATION ---
function Navigation({ activeSection }: { activeSection: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Collections", href: "#collections" },
    { label: "About", href: "#about" },
    { label: "Gold Rate", href: "#gold-rate" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(212,175,55,0.15)" : "none",
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo */}
            <button
              type="button"
              onClick={() => scrollTo("#home")}
              className="flex items-center gap-3"
            >
              <img
                src="/assets/generated/pj-logo-transparent.dim_200x200.png"
                alt="Punjab Jewellers"
                className="w-10 h-10 object-contain"
              />
              <div className="flex flex-col">
                <span
                  className="font-display text-lg font-medium leading-none"
                  style={{ color: "#D4AF37" }}
                >
                  Punjab Jewellers
                </span>
                <span
                  className="font-body text-[9px] tracking-[0.25em] uppercase"
                  style={{ color: "rgba(212,175,55,0.6)" }}
                >
                  Est. 1985 · Patiala
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.href}
                  data-ocid="nav.link"
                  onClick={() => scrollTo(link.href)}
                  className="font-body text-sm tracking-widest uppercase transition-colors duration-300 relative group"
                  style={{
                    color:
                      activeSection === link.href.slice(1)
                        ? "#D4AF37"
                        : "rgba(255,255,255,0.7)",
                  }}
                >
                  {link.label}
                  <span
                    className="absolute -bottom-1 left-0 h-px transition-all duration-300 group-hover:w-full"
                    style={{
                      backgroundColor: "#D4AF37",
                      width:
                        activeSection === link.href.slice(1) ? "100%" : "0",
                    }}
                  />
                </button>
              ))}
              <a
                href={WHATSAPP_BASE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-5 py-2 rounded text-xs tracking-widest uppercase font-semibold"
              >
                WhatsApp Us
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              data-ocid="nav.hamburger_button"
              className="md:hidden p-2 text-gold"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col pt-20 px-6 pb-8"
            style={{ backgroundColor: "#0a0a0a" }}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  data-ocid="nav.link"
                  onClick={() => scrollTo(link.href)}
                  className="font-display text-3xl font-light text-left"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.a
                href={WHATSAPP_BASE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-4 px-6 py-3 rounded text-center text-sm tracking-widest uppercase font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                WhatsApp Us
              </motion.a>
            </div>
            <div className="mt-auto text-center">
              <p
                className="font-body text-sm"
                style={{ color: "rgba(212,175,55,0.6)" }}
              >
                {ADDRESS}
              </p>
              <p
                className="font-body text-sm mt-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {PHONE}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- HERO SECTION ---
function HeroSection() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "#07070a" }}
    >
      {/* Grain noise texture for luxury depth (P2) */}
      <div className="hero-noise" aria-hidden="true" />

      {/* Background radial glow — boosted (P0) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 65% 50%, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 45%, transparent 70%)",
          zIndex: 0,
        }}
      />
      {/* Secondary warm vignette bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(212,175,55,0.06) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      {/* 3D Canvas — closer camera (P0) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 48 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <JewelryModel />
        </Canvas>
      </div>

      {/* Overlay gradient for text readability — stronger left pull */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(7,7,10,0.97) 0%, rgba(7,7,10,0.88) 38%, rgba(7,7,10,0.55) 58%, rgba(7,7,10,0.15) 75%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20"
        style={{ zIndex: 3 }}
      >
        <div style={{ maxWidth: "600px" }}>
          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.4 }}
            className="flex items-center gap-3 mb-8"
          >
            <span
              className="inline-block h-px w-8"
              style={{ backgroundColor: "rgba(212,175,55,0.6)" }}
            />
            <p
              className="font-body text-[10px] tracking-[0.45em] uppercase"
              style={{ color: "rgba(212,175,55,0.85)" }}
            >
              Since 1985 &ensp;·&ensp; Patiala, Punjab
            </p>
            <span
              className="inline-block h-px w-8"
              style={{ backgroundColor: "rgba(212,175,55,0.6)" }}
            />
          </motion.div>

          {/* P0: Typography redesign — small word up, massive dominant word below */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 2.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-2"
          >
            <span
              className="font-display block"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                fontWeight: 300,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1,
              }}
            >
              Timeless
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 2.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-1"
          >
            <span
              className="font-display block italic"
              style={{
                fontSize: "clamp(5rem, 13vw, 10.5rem)",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                color: "#D4AF37",
                lineHeight: 0.88,
                textShadow:
                  "0 0 60px rgba(212,175,55,0.35), 0 0 120px rgba(212,175,55,0.15)",
              }}
            >
              Luxury.
            </span>
          </motion.div>

          <motion.h2
            className="font-display italic mt-4 mb-7"
            style={{
              fontSize: "clamp(1.3rem, 2.8vw, 2.1rem)",
              fontWeight: 300,
              color: "oklch(82% 0.07 80)",
              letterSpacing: "0.04em",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.9 }}
          >
            Crafted in Gold.
          </motion.h2>

          <motion.p
            className="font-body mb-10 leading-relaxed"
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.55)",
              maxWidth: "440px",
              lineHeight: "1.8",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 3.05 }}
          >
            Premium gold & diamond jewellery crafted for elegance and tradition.
            Trusted by over 5,000 families in Patiala and beyond.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 3.2 }}
          >
            <button
              type="button"
              data-ocid="hero.primary_button"
              onClick={() => scrollTo("#collections")}
              className="btn-gold px-9 py-4 text-xs tracking-[0.15em] uppercase font-bold"
            >
              Explore Collection
            </button>
            <button
              type="button"
              data-ocid="hero.secondary_button"
              onClick={() => scrollTo("#location")}
              className="btn-ghost-gold px-9 py-4 text-xs tracking-[0.12em]"
            >
              Visit Showroom
            </button>
          </motion.div>

          {/* Trust badges — refined, smaller, elegant */}
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 3.4 }}
          >
            {[
              { text: "Since 1985" },
              { text: "BIS Hallmark" },
              { text: "5000+ Families" },
              { text: "★★★★★ Rated" },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-1.5 px-3 py-1.5"
                style={{
                  backgroundColor: "rgba(212,175,55,0.06)",
                  border: "1px solid rgba(212,175,55,0.18)",
                  borderRadius: "2px",
                }}
              >
                <span
                  className="font-body text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "rgba(212,175,55,0.8)" }}
                >
                  {badge.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 3 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 3.8, duration: 0.6 },
          y: {
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 3.8,
          },
        }}
      >
        <span
          className="font-body text-[9px] tracking-[0.4em] uppercase"
          style={{ color: "rgba(212,175,55,0.45)" }}
        >
          Scroll
        </span>
        <ChevronDown size={14} style={{ color: "rgba(212,175,55,0.45)" }} />
      </motion.div>
    </section>
  );
}

// --- GOLD RATE SECTION ---
function GoldRateSection() {
  const { data: goldPrices, isLoading } = useGoldPrices();
  const prices =
    goldPrices && goldPrices.length > 0 ? goldPrices : FALLBACK_GOLD;

  const formatPrice = (price: bigint) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  return (
    <section
      id="gold-rate"
      className="py-28"
      style={{ backgroundColor: "#0c0c0c" }}
    >
      {/* Section divider top (P2) */}
      <div className="section-divider mb-16 opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="font-body text-[10px] tracking-[0.5em] uppercase mb-5"
            style={{ color: "rgba(212,175,55,0.75)" }}
          >
            Live Rates
          </p>
          {/* P2: proper underline wrapper */}
          <div className="section-heading-wrap">
            <h2 className="section-heading">
              Today's <span>Gold Rate</span>
            </h2>
          </div>
          <p
            className="font-body text-sm tracking-wide mt-8"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Updated Daily &ensp;·&ensp; Prices in ₹ INR per gram
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-gold" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {prices.map((price, i) => (
              <motion.div
                key={price.purity}
                data-ocid={`goldrate.card.${i + 1}`}
                className="relative overflow-hidden p-10 text-center"
                style={{
                  backgroundColor: "#0d0d0d",
                  border: "1px solid rgba(212,175,55,0.22)",
                  borderRadius: "3px",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                whileHover={{
                  boxShadow: "var(--gold-glow-strong)",
                  borderColor: "rgba(212,175,55,0.5)",
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #D4AF37 40%, #F2D060 50%, #D4AF37 60%, transparent)",
                  }}
                />
                {/* Purity badge */}
                <div className="mb-5">
                  <span
                    className="font-body text-[11px] tracking-[0.35em] uppercase px-4 py-1.5"
                    style={{
                      backgroundColor: "rgba(212,175,55,0.08)",
                      color: "rgba(212,175,55,0.9)",
                      border: "1px solid rgba(212,175,55,0.25)",
                      borderRadius: "1px",
                    }}
                  >
                    {price.purity} Gold
                  </span>
                </div>
                {/* Price — large display */}
                <p
                  className="font-display mb-1"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 3.8rem)",
                    color: "#D4AF37",
                    fontWeight: 300,
                    lineHeight: 1,
                    textShadow: "0 0 40px rgba(212,175,55,0.25)",
                  }}
                >
                  {formatPrice(price.pricePerGram)}
                </p>
                <p
                  className="font-body text-xs tracking-[0.3em] uppercase mt-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Per Gram
                </p>
                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        <motion.p
          className="text-center font-body text-[11px] mt-10 tracking-wide"
          style={{ color: "rgba(255,255,255,0.28)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Rates are indicative. Call showroom for exact pricing.
        </motion.p>
      </div>

      {/* Section divider bottom */}
      <div className="section-divider mt-16 opacity-60" />
    </section>
  );
}

// --- PRODUCT CARD ---
interface ProductCardProps {
  product: Product;
  index: number;
  onViewDetails: (product: Product) => void;
}

function ProductCard({ product, index, onViewDetails }: ProductCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const imageUrl =
    CATEGORY_IMAGES[product.category] ||
    "/assets/generated/necklace-hero.dim_800x800.jpg";

  const formatPrice = (price: bigint) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  const waLink = `${WHATSAPP_BASE}?text=${encodeURIComponent(`I am interested in ${product.name}`)}`;

  return (
    <motion.div
      ref={cardRef}
      data-ocid={`collections.item.${index + 1}`}
      className="relative overflow-hidden group cursor-pointer card-shimmer"
      style={{
        backgroundColor: "#0d0d0d",
        border: "1px solid rgba(212,175,55,0.13)",
        borderRadius: "4px",
        transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(0)`,
        transition:
          "transform 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease, border-color 0.35s ease",
        willChange: "transform",
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        boxShadow: "var(--card-glow)",
        borderColor: "rgba(212,175,55,0.5)",
      }}
    >
      {/* Image — taller for luxury portrait feel (P1) */}
      <div className="relative overflow-hidden" style={{ height: "300px" }}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-107"
          style={{ transformOrigin: "center center" }}
          loading="lazy"
        />
        {/* Rich multi-stop gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.5) 35%, rgba(13,13,13,0.1) 65%, transparent 100%)",
          }}
        />
        {/* Warm gold vignette edges on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(212,175,55,0.08) 100%)",
          }}
        />

        {/* Tags — cleaner, sharper (P1) */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.tags
            .filter((t) => t === "BESTSELLER" || t === "NEW")
            .map((tag) => (
              <span
                key={tag}
                className="font-body text-[9px] tracking-[0.2em] uppercase px-2.5 py-1"
                style={{
                  backgroundColor:
                    tag === "BESTSELLER"
                      ? "rgba(212,175,55,0.9)"
                      : "rgba(13,13,13,0.88)",
                  color: tag === "BESTSELLER" ? "#050505" : "#D4AF37",
                  border:
                    tag === "NEW" ? "1px solid rgba(212,175,55,0.7)" : "none",
                  borderRadius: "1px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                }}
              >
                {tag}
              </span>
            ))}
        </div>

        {/* Category — bottom left */}
        <div className="absolute bottom-3 left-3">
          <span
            className="font-body text-[10px] tracking-[0.25em] uppercase px-2.5 py-1"
            style={{
              backgroundColor: "rgba(13,13,13,0.7)",
              color: "rgba(212,175,55,0.8)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "1px",
            }}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-4">
        <h3
          className="font-display mb-1.5 leading-tight"
          style={{
            color: "oklch(94% 0.03 80)",
            fontSize: "1.3rem",
            fontWeight: 400,
          }}
        >
          {product.name}
        </h3>
        <p
          className="font-body leading-relaxed mb-4"
          style={{
            color: "rgba(255,255,255,0.48)",
            fontSize: "0.8rem",
            lineHeight: "1.7",
          }}
        >
          {product.description}
        </p>
        {/* Price row */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p
              className="font-display"
              style={{
                color: "#D4AF37",
                fontSize: "1.5rem",
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              {formatPrice(product.price)}
            </p>
            <p
              className="font-body text-[10px] tracking-wide mt-0.5"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Incl. making & GST
            </p>
          </div>
          {/* Subtle quality mark */}
          <div
            className="flex items-center gap-1 px-2 py-1"
            style={{
              border: "1px solid rgba(212,175,55,0.18)",
              borderRadius: "1px",
            }}
          >
            <span
              className="font-body text-[9px] tracking-widest uppercase"
              style={{ color: "rgba(212,175,55,0.55)" }}
            >
              22K
            </span>
          </div>
        </div>
        {/* Action row */}
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid={`product.detail_button.${index + 1}`}
            onClick={() => onViewDetails(product)}
            className="flex-1 btn-gold py-3 text-[10px] tracking-[0.18em] uppercase font-bold"
          >
            View Details
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid={`product.whatsapp_button.${index + 1}`}
            className="flex-1 btn-ghost-gold py-3 text-[10px] tracking-[0.15em] uppercase text-center"
          >
            <span className="flex items-center justify-center gap-1.5">
              <MessageCircle size={12} />
              Inquire
            </span>
          </a>
        </div>
      </div>

      {/* Inner border highlight — inset glow ring on hover (P1) */}
      <div className="product-card-border" />
    </motion.div>
  );
}

// --- COLLECTIONS SECTION ---
function CollectionsSection() {
  const { data: products, isLoading } = useActiveProducts();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const displayProducts =
    products && products.length > 0 ? products : FALLBACK_PRODUCTS;
  const filtered =
    activeCategory === "All"
      ? displayProducts
      : displayProducts.filter((p) => p.category === activeCategory);

  const formatPrice = (price: bigint) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  return (
    <section
      id="collections"
      className="py-28"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="font-body text-[10px] tracking-[0.5em] uppercase mb-5"
            style={{ color: "rgba(212,175,55,0.75)" }}
          >
            Handcrafted for You
          </p>
          <div className="section-heading-wrap">
            <h2 className="section-heading">
              Our <span>Collections</span>
            </h2>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              data-ocid="collections.tab"
              onClick={() => setActiveCategory(cat)}
              className="font-body text-xs tracking-widest uppercase px-5 py-2.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  activeCategory === cat ? "#D4AF37" : "rgba(212,175,55,0.06)",
                color:
                  activeCategory === cat ? "#0a0a0a" : "rgba(255,255,255,0.65)",
                border:
                  activeCategory === cat
                    ? "1px solid #D4AF37"
                    : "1px solid rgba(212,175,55,0.2)",
                fontWeight: activeCategory === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2
              className="animate-spin"
              style={{ color: "#D4AF37" }}
              size={40}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={i}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p
              className="font-display text-2xl"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              No products in this category yet
            </p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent
          data-ocid="product.modal"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: "#111",
            border: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle
                  className="font-display text-2xl font-light"
                  style={{ color: "oklch(95% 0.04 85)" }}
                >
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <img
                  src={
                    CATEGORY_IMAGES[selectedProduct.category] ||
                    "/assets/generated/necklace-hero.dim_800x800.jpg"
                  }
                  alt={selectedProduct.name}
                  className="w-full h-72 object-cover rounded-xl mb-5"
                />
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="font-display text-2xl"
                    style={{ color: "#D4AF37" }}
                  >
                    {formatPrice(selectedProduct.price)}
                  </span>
                  <span
                    className="font-body text-xs px-3 py-1 rounded-full tracking-wide"
                    style={{
                      backgroundColor: "rgba(212,175,55,0.12)",
                      color: "#D4AF37",
                      border: "1px solid rgba(212,175,55,0.25)",
                    }}
                  >
                    {selectedProduct.category}
                  </span>
                </div>
                <p
                  className="font-body text-sm leading-relaxed mb-4"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {selectedProduct.description}
                </p>
                <div className="glass rounded-xl p-4 mb-5">
                  <p
                    className="font-body text-xs tracking-wide"
                    style={{ color: "rgba(212,175,55,0.8)" }}
                  >
                    🔄 360° View Available In-Store
                  </p>
                  <p
                    className="font-body text-xs mt-1"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Visit our showroom to experience the full 360° rotation
                    viewing of this piece.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`I am interested in ${selectedProduct.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid={`product.whatsapp_button.${Number(selectedProduct.id)}`}
                    className="flex-1 btn-gold py-3 rounded text-xs tracking-widest uppercase font-semibold text-center flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} />
                    WhatsApp Inquiry
                  </a>
                  <button
                    type="button"
                    data-ocid="product.close_button"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 btn-ghost-gold py-3 rounded text-xs tracking-widest uppercase"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// --- ABOUT SECTION ---
function AboutSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      id="about"
      className="py-28 overflow-hidden relative"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.05) 0%, transparent 60%)",
          y,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="font-body text-[10px] tracking-[0.5em] uppercase mb-5"
              style={{ color: "rgba(212,175,55,0.75)" }}
            >
              Our Heritage
            </p>
            <h2 className="section-heading mb-8" style={{ display: "block" }}>
              Our <span>Story</span>
            </h2>
            <p
              className="font-body leading-relaxed mb-8"
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "1.05rem",
                lineHeight: "1.8",
              }}
            >
              Punjab Jewellers is one of Patiala's most trusted jewellery
              destinations, located at GOL GAPPA CHOWNK. Known for premium
              craftsmanship and elegant gold designs, the showroom offers
              luxurious jewellery collections for weddings, celebrations, and
              timeless everyday elegance.
            </p>
            <p
              className="font-body leading-relaxed mb-10"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.95rem",
                lineHeight: "1.8",
              }}
            >
              For over four decades, we have been crafting dreams into gold —
              each piece tells a story of tradition, artistry, and trust passed
              down through generations.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Award,
                  label: "Certified Quality",
                  desc: "BIS Hallmark & certified gold",
                },
                {
                  icon: Palette,
                  label: "Custom Designs",
                  desc: "Bespoke jewellery crafted for you",
                },
                {
                  icon: Diamond,
                  label: "Bridal Expert",
                  desc: "Complete bridal collections",
                },
                {
                  icon: Heart,
                  label: "50+ Years Trust",
                  desc: "Serving Patiala since 1985",
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="glass rounded-xl p-4 hover:border-gold transition-all duration-300 group"
                  style={{ borderColor: "rgba(212,175,55,0.2)" }}
                >
                  <Icon
                    size={22}
                    className="mb-2 transition-colors duration-300 group-hover:text-gold"
                    style={{ color: "#D4AF37" }}
                  />
                  <p
                    className="font-body text-sm font-medium mb-1"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="font-body text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Decorative */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Decorative rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid rgba(212,175,55,${0.15 / ring})`,
                    margin: `${(ring - 1) * 12}%`,
                  }}
                  animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
                  transition={{
                    duration: 20 * ring,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
              ))}
              {/* Logo center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-48 h-48 rounded-full flex flex-col items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.04) 60%, transparent 100%)",
                    border: "1px solid rgba(212,175,55,0.35)",
                    boxShadow: "var(--gold-glow)",
                  }}
                >
                  <img
                    src="/assets/generated/pj-logo-transparent.dim_200x200.png"
                    alt="Punjab Jewellers"
                    className="w-20 h-20 object-contain"
                  />
                  <span
                    className="font-display text-sm mt-2 tracking-widest"
                    style={{ color: "#D4AF37" }}
                  >
                    PUNJAB JEWELLERS
                  </span>
                  <span
                    className="font-body text-[9px] tracking-[0.3em] uppercase mt-1"
                    style={{ color: "rgba(212,175,55,0.5)" }}
                  >
                    Est. 1985
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- TESTIMONIALS SECTION ---
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Beautiful craftsmanship and trusted gold quality. Punjab Jewellers never disappoints!",
      name: "Harpreet Kaur",
      location: "Patiala",
      rating: 5,
    },
    {
      quote:
        "Best jewellery showroom in Patiala. Amazing collection and wonderful service!",
      name: "Rajiv Sharma",
      location: "Chandigarh",
      rating: 5,
    },
    {
      quote:
        "Perfect bridal collection. Made our wedding truly unforgettable and memorable.",
      name: "Simran Bhatia",
      location: "Ludhiana",
      rating: 5,
    },
  ];

  return (
    <section className="py-28" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="font-body text-[10px] tracking-[0.5em] uppercase mb-5"
            style={{ color: "rgba(212,175,55,0.75)" }}
          >
            Testimonials
          </p>
          <div className="section-heading-wrap">
            <h2 className="section-heading">
              What Our <span>Customers</span> Say
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              data-ocid={`testimonials.item.${i + 1}`}
              className="relative overflow-hidden p-7"
              style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid rgba(212,175,55,0.16)",
                borderRadius: "3px",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{
                boxShadow: "var(--gold-glow)",
                borderColor: "rgba(212,175,55,0.4)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background:
                    i === 1
                      ? "linear-gradient(90deg, transparent, #D4AF37 30%, #F2D060 50%, #D4AF37 70%, transparent)"
                      : "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
                }}
              />
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }, (_, si) => {
                  const starKey = `star-${t.name}-${si}`;
                  return (
                    <Star
                      key={starKey}
                      size={14}
                      fill="#D4AF37"
                      style={{ color: "#D4AF37" }}
                    />
                  );
                })}
              </div>
              {/* Quote mark */}
              <p
                className="font-display absolute top-4 right-6 text-6xl leading-none"
                style={{ color: "rgba(212,175,55,0.1)", fontStyle: "italic" }}
              >
                "
              </p>
              <p
                className="font-body leading-relaxed mb-6"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.95rem",
                  lineHeight: "1.7",
                }}
              >
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-medium"
                  style={{
                    backgroundColor: "rgba(212,175,55,0.15)",
                    color: "#D4AF37",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p
                    className="font-body text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="font-body text-xs"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- LOCATION SECTION ---
function LocationSection() {
  return (
    <section
      id="location"
      className="py-28"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="font-body text-[10px] tracking-[0.5em] uppercase mb-5"
            style={{ color: "rgba(212,175,55,0.75)" }}
          >
            Find Us
          </p>
          <div className="section-heading-wrap">
            <h2 className="section-heading">
              Visit Our <span>Showroom</span>
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12 items-start">
          {/* Map */}
          <motion.div
            className="lg:col-span-3 rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(212,175,55,0.2)",
              height: "400px",
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <iframe
              src="https://maps.google.com/maps?q=Punjab+Jewellers,+Gol+Gappa+Chownk,+Tripuri,+Patiala,+Punjab+147004&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Punjab Jewellers Location"
            />
          </motion.div>

          {/* Info Card */}
          <motion.div
            className="lg:col-span-2 glass rounded-2xl p-7 flex flex-col gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="flex items-start gap-3 mb-3">
                <MapPin
                  size={18}
                  style={{ color: "#D4AF37", marginTop: "3px", flexShrink: 0 }}
                />
                <div>
                  <p
                    className="font-display text-lg font-medium mb-1"
                    style={{ color: "oklch(95% 0.04 85)" }}
                  >
                    Punjab Jewellers
                  </p>
                  <p
                    className="font-body text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {ADDRESS}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Phone size={16} style={{ color: "#D4AF37", flexShrink: 0 }} />
                <p
                  className="font-body text-sm"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {PHONE}
                </p>
              </div>
            </div>

            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(212,175,55,0.3), transparent)",
              }}
            />

            <div className="flex flex-col gap-3">
              <a
                href={`tel:${PHONE}`}
                data-ocid="location.call_button"
                className="btn-gold flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm tracking-widest uppercase font-semibold"
              >
                <Phone size={15} />
                Call Now
              </a>
              <a
                href={WHATSAPP_BASE}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="location.whatsapp_button"
                className="btn-ghost-gold flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm tracking-widest uppercase"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="location.directions_button"
                className="font-body flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm tracking-widest uppercase transition-all duration-300"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "transparent",
                }}
              >
                <MapPin size={15} />
                Get Directions
              </a>
            </div>

            <div className="glass rounded-xl p-4">
              <p
                className="font-body text-xs tracking-wide mb-1"
                style={{ color: "rgba(212,175,55,0.8)" }}
              >
                ⏰ Showroom Hours
              </p>
              <p
                className="font-body text-xs"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Monday – Sunday: 10:00 AM – 9:00 PM
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- CONTACT SECTION ---
function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    productInterest: "",
    message: "",
  });
  const {
    mutate: submitInquiry,
    isPending,
    isSuccess,
    isError,
    reset,
  } = useSubmitInquiry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.productInterest || !form.message) {
      toast.error("Please fill all fields");
      return;
    }
    submitInquiry(form, {
      onSuccess: () => {
        toast.success("Inquiry sent successfully! We'll contact you soon.");
        setForm({ name: "", phone: "", productInterest: "", message: "" });
      },
      onError: () => {
        toast.error("Something went wrong. Please try WhatsApp instead.");
      },
    });
  };

  return (
    <section
      id="contact"
      className="py-28"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="font-body text-[10px] tracking-[0.5em] uppercase mb-5"
            style={{ color: "rgba(212,175,55,0.75)" }}
          >
            Inquire Now
          </p>
          <div className="section-heading-wrap">
            <h2 className="section-heading">
              Get in <span>Touch</span>
            </h2>
          </div>
          <p
            className="font-body mt-8 text-sm"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Have a question about our jewellery? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto">
          <motion.div
            className="relative overflow-hidden p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "3px",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #D4AF37 30%, #F2D060 50%, #D4AF37 70%, transparent)",
              }}
            />

            {isSuccess ? (
              <div
                data-ocid="contact.success_state"
                className="flex flex-col items-center py-12 gap-4"
              >
                <CheckCircle size={48} style={{ color: "#D4AF37" }} />
                <p
                  className="font-display text-2xl"
                  style={{ color: "oklch(95% 0.04 85)" }}
                >
                  Inquiry Received!
                </p>
                <p
                  className="font-body text-sm text-center"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Thank you! We'll get back to you shortly. You can also reach
                  us directly on WhatsApp.
                </p>
                <a
                  href={WHATSAPP_BASE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold mt-2 px-6 py-3 rounded text-sm tracking-widest uppercase font-semibold"
                >
                  WhatsApp Us Now
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="font-body text-xs tracking-widest uppercase mb-2 block"
                      style={{ color: "rgba(212,175,55,0.7)" }}
                    >
                      Your Name *
                    </label>
                    <Input
                      id="contact-name"
                      data-ocid="contact.input"
                      placeholder="Priya Sharma"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="bg-transparent font-body"
                      style={{
                        borderColor: "rgba(212,175,55,0.25)",
                        color: "rgba(255,255,255,0.9)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="font-body text-xs tracking-widest uppercase mb-2 block"
                      style={{ color: "rgba(212,175,55,0.7)" }}
                    >
                      Phone *
                    </label>
                    <Input
                      id="contact-phone"
                      data-ocid="contact.phone_input"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      type="tel"
                      className="bg-transparent font-body"
                      style={{
                        borderColor: "rgba(212,175,55,0.25)",
                        color: "rgba(255,255,255,0.9)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-interest"
                    className="font-body text-xs tracking-widest uppercase mb-2 block"
                    style={{ color: "rgba(212,175,55,0.7)" }}
                  >
                    Product Interest *
                  </label>
                  <Select
                    value={form.productInterest}
                    onValueChange={(val) =>
                      setForm((p) => ({ ...p, productInterest: val }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="contact.select"
                      className="bg-transparent font-body"
                      style={{
                        borderColor: "rgba(212,175,55,0.25)",
                        color: form.productInterest
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.4)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "#111",
                        border: "1px solid rgba(212,175,55,0.25)",
                      }}
                    >
                      {[
                        "Necklaces",
                        "Rings",
                        "Bridal",
                        "Bangles",
                        "Earrings",
                        "Wedding Sets",
                        "Custom Design",
                        "General Inquiry",
                      ].map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="font-body"
                          style={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="font-body text-xs tracking-widest uppercase mb-2 block"
                    style={{ color: "rgba(212,175,55,0.7)" }}
                  >
                    Message *
                  </label>
                  <Textarea
                    id="contact-message"
                    data-ocid="contact.textarea"
                    placeholder="Tell us what you're looking for..."
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    rows={4}
                    className="bg-transparent font-body resize-none"
                    style={{
                      borderColor: "rgba(212,175,55,0.25)",
                      color: "rgba(255,255,255,0.9)",
                      backgroundColor: "rgba(255,255,255,0.03)",
                    }}
                  />
                </div>

                {isError && (
                  <div
                    data-ocid="contact.error_state"
                    className="flex items-center gap-2 text-red-400 text-sm font-body"
                  >
                    <AlertCircle size={16} />
                    <span>
                      Something went wrong. Please try WhatsApp or call us
                      directly.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  data-ocid="contact.submit_button"
                  disabled={isPending}
                  className="btn-gold py-4 rounded-lg text-sm tracking-widest uppercase font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Inquiry"
                  )}
                </button>

                <p
                  className="text-center font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Or reach us directly:{" "}
                  <a
                    href={WHATSAPP_BASE}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#D4AF37" }}
                  >
                    WhatsApp
                  </a>{" "}
                  |{" "}
                  <a href={`tel:${PHONE}`} style={{ color: "#D4AF37" }}>
                    {PHONE}
                  </a>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- LEGAL MODALS ---
const LEGAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    content:
      'Last updated: March 2026\n\nPunjab Jewellers ("we", "our", or "us") is committed to protecting your personal information.\n\nInformation We Collect: We collect information you provide directly, such as your name, phone number, and product inquiries.\n\nHow We Use Information: To respond to your inquiries, provide customer service, and send relevant product information.\n\nData Sharing: We do not sell, trade, or rent your personal information to third parties.\n\nContact Us: Punjab Jewellers, GOL GAPPA CHOWNK, SCO 946, Tripuri, Patiala, Punjab 147004. Phone: 09815757180',
  },
  terms: {
    title: "Terms & Conditions",
    content:
      "Last updated: March 2026\n\nBy using this website, you agree to these terms.\n\nProduct Information: All prices are indicative and may change. Contact our showroom for exact pricing.\n\nGold Rates: Gold rates displayed are approximate and updated periodically. Actual prices may vary.\n\nInquiries: Submitting an inquiry does not constitute a purchase or reservation.\n\nIntellectual Property: All content on this website is property of Punjab Jewellers.\n\nLimitation of Liability: Punjab Jewellers is not liable for any indirect damages arising from website use.\n\nContact: 09815757180 | GOL GAPPA CHOWNK, SCO 946, Patiala",
  },
  refund: {
    title: "Refund Policy",
    content:
      "Last updated: March 2026\n\nAt Punjab Jewellers, we take pride in the quality of our jewellery.\n\nExchange Policy: We offer exchange within 7 days of purchase with original receipt and in original condition.\n\nRefunds: Refunds are processed for manufacturing defects only, after inspection at our showroom.\n\nCustom Orders: Custom-designed jewellery is not eligible for returns or exchanges.\n\nGold Value: Exchange value is based on current gold rate at time of exchange.\n\nFor any refund queries, please visit our showroom or call 09815757180.",
  },
};

// --- FOOTER ---
function Footer({
  onOpenLegal,
}: {
  onOpenLegal: (type: "privacy" | "terms" | "refund") => void;
}) {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="relative py-16 border-t"
      style={{
        backgroundColor: "#080808",
        borderColor: "rgba(212,175,55,0.15)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/generated/pj-logo-transparent.dim_200x200.png"
                alt="Punjab Jewellers"
                className="w-10 h-10 object-contain"
              />
              <span
                className="font-display text-lg"
                style={{ color: "#D4AF37" }}
              >
                Punjab Jewellers
              </span>
            </div>
            <p
              className="font-display text-base italic mb-4 leading-relaxed"
              style={{ color: "rgba(212,175,55,0.7)" }}
            >
              "Timeless Luxury. Crafted in Gold."
            </p>
            <p
              className="font-body text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Your trusted partner for premium gold and diamond jewellery in
              Patiala since 1985.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-body text-xs tracking-[0.3em] uppercase mb-5"
              style={{ color: "rgba(212,175,55,0.7)" }}
            >
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Home", href: "#home" },
                { label: "Collections", href: "#collections" },
                { label: "About Us", href: "#about" },
                { label: "Gold Rate", href: "#gold-rate" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                <button
                  type="button"
                  key={link.href}
                  data-ocid="footer.link"
                  onClick={() => scrollTo(link.href)}
                  className="font-body text-sm text-left transition-colors duration-300 hover:text-gold w-fit"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className="font-body text-xs tracking-[0.3em] uppercase mb-5"
              style={{ color: "rgba(212,175,55,0.7)" }}
            >
              Contact Us
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  style={{ color: "#D4AF37", marginTop: "3px", flexShrink: 0 }}
                />
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {ADDRESS}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} style={{ color: "#D4AF37", flexShrink: 0 }} />
                <a
                  href={`tel:${PHONE}`}
                  className="font-body text-sm hover:text-gold transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {PHONE}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle
                  size={14}
                  style={{ color: "#D4AF37", flexShrink: 0 }}
                />
                <a
                  href={WHATSAPP_BASE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm hover:text-gold transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="h-px mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)",
          }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="font-body text-xs"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            © {year} Punjab Jewellers. All Rights Reserved.
          </p>
          <div className="flex gap-5">
            <button
              type="button"
              data-ocid="footer.privacy_button"
              onClick={() => onOpenLegal("privacy")}
              className="font-body text-xs hover:text-gold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              data-ocid="footer.terms_button"
              onClick={() => onOpenLegal("terms")}
              className="font-body text-xs hover:text-gold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Terms & Conditions
            </button>
            <button
              type="button"
              data-ocid="footer.refund_button"
              onClick={() => onOpenLegal("refund")}
              className="font-body text-xs hover:text-gold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Refund Policy
            </button>
          </div>
          <p
            className="font-body text-xs"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Built with ❤️ using{" "}
            <a
              href={caffeineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
              style={{ color: "rgba(212,175,55,0.5)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- MAIN APP ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [legalModal, setLegalModal] = useState<
    "privacy" | "terms" | "refund" | null
  >(null);

  const handleLoadingDone = useCallback(() => {
    setLoading(false);
  }, []);

  // Intersection observer for active section tracking
  useEffect(() => {
    const sections = [
      "home",
      "collections",
      "about",
      "gold-rate",
      "location",
      "contact",
    ];
    const observers: IntersectionObserver[] = [];

    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  const legalContent = legalModal ? LEGAL_CONTENT[legalModal] : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      <AnimatePresence>
        {loading && <LoadingScreen onDone={handleLoadingDone} />}
      </AnimatePresence>

      {!loading && (
        <>
          <Navigation activeSection={activeSection} />

          <main>
            <HeroSection />
            <GoldRateSection />
            <CollectionsSection />
            <AboutSection />
            <TestimonialsSection />
            <LocationSection />
            <ContactSection />
          </main>

          <Footer onOpenLegal={setLegalModal} />

          {/* Legal Modal */}
          <Dialog
            open={!!legalModal}
            onOpenChange={(open) => !open && setLegalModal(null)}
          >
            <DialogContent
              data-ocid="legal.modal"
              className="max-w-xl max-h-[80vh] overflow-y-auto"
              style={{
                backgroundColor: "#111",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              {legalContent && (
                <>
                  <DialogHeader>
                    <DialogTitle
                      className="font-display text-2xl font-light"
                      style={{ color: "#D4AF37" }}
                    >
                      {legalContent.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <div
                      className="font-body text-sm leading-relaxed whitespace-pre-line"
                      style={{ color: "rgba(255,255,255,0.65)" }}
                    >
                      {legalContent.content}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        data-ocid="legal.close_button"
                        onClick={() => setLegalModal(null)}
                        className="btn-gold px-6 py-2.5 rounded text-xs tracking-widest uppercase font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Floating WhatsApp Button */}
          <motion.a
            href={WHATSAPP_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-body text-xs tracking-wide font-medium shadow-lg"
            style={{
              backgroundColor: "#25D366",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 3.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={18} fill="#fff" />
            <span className="hidden sm:inline">Chat on WhatsApp</span>
          </motion.a>
        </>
      )}

      <Toaster position="top-center" />
    </div>
  );
}
