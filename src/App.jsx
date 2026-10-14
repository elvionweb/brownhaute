import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  ArrowUpRight,
  Eye,
  PenTool,
  Smile,
  Feather,
  Heart,
  Plus,
  Check,
  Home,
  MessageCircle,
  Sparkle,
  MoveHorizontal,
} from "lucide-react";
import { FaWhatsapp, FaTiktok } from "react-icons/fa";

/* ====================================================================
   CONFIG — change contact details, links and copy here
   ==================================================================== */
const BRAND = "Brownhaute";
const WHATSAPP = "2348124412544"; // wa.me format: country code + number, no "+"
const PHONE_DISPLAY = "0812 441 2544";
const PHONE_TEL = "+2348124412544";
const CITY = "Abuja";
const TIKTOK = "https://www.tiktok.com/@brownhaute";
const TIKTOK_HANDLE = "@brownhaute";
const MAP_QUERY = "Abuja, Nigeria";
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

const wa = (msg = `Hi ${BRAND}! I'd like to make a booking.`) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

const img = (n) => `/images/${n}.webp`;

/* ====================================================================
   SMOOTH SCROLL (works on mobile even when the menu collapses)
   ==================================================================== */
const NAV_OFFSET = 64;
function smoothScrollTo(hash) {
  const id = hash.replace("#", "");
  const el = id === "top" ? null : document.getElementById(id);
  if (id !== "top" && !el) return;
  const getTarget = () =>
    id === "top" ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: getTarget(), behavior: "instant" });
    return;
  }
  const startY = window.scrollY;
  const duration = Math.min(1100, Math.max(500, Math.abs(getTarget() - startY) * 0.5));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let t0 = null;
  let cancelled = false;
  const cancel = () => { cancelled = true; };
  const cleanup = () => {
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("wheel", cancel);
  };
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("wheel", cancel, { passive: true });
  const step = (now) => {
    if (cancelled) return cleanup();
    if (t0 === null) t0 = now;
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo({ top: startY + (getTarget() - startY) * ease(p), behavior: "instant" });
    if (p < 1) requestAnimationFrame(step);
    else cleanup();
  };
  requestAnimationFrame(step);
}
const goTo = (e, hash, after) => {
  e.preventDefault();
  smoothScrollTo(hash);
  history.replaceState(null, "", hash);
  after?.();
};

/* ====================================================================
   DATA
   ==================================================================== */
const NAV = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "work", label: "Gallery" },
  { id: "process", label: "How to book" },
  { id: "contact", label: "Contact" },
];

const HERO_SLIDES = [
  { src: "braces-purple", label: "Fashion braces", pos: "50% 55%" },
  { src: "lash-braids", label: "Lash extensions", pos: "50% 40%" },
  { src: "tattoo-spine", label: "Tattoo art", pos: "50% 45%" },
  { src: "lips-brows", label: "Brows & lips", pos: "50% 45%" },
  { src: "anime-set", label: "Anime lash set", pos: "50% 40%" },
];

const SERVICES = [
  {
    key: "Lash Extensions",
    icon: Eye,
    src: "lash-curtain",
    pos: "50% 45%",
    blurb: "Fresh sets, careful removals and full, fluffy volume from soft everyday looks to dramatic anime sets.",
    points: ["Fresh lash set installation", "Lash removal", "Volume & anime styles", "Home service available"],
    tag: "Promo: set ₦35k · bottom lash free",
  },
  {
    key: "Tattoo Art",
    icon: PenTool,
    src: "tattoo-spine",
    pos: "50% 40%",
    blurb: "Hand-placed designs fine-line florals, tribal pieces, celestial spines and flowing script.",
    points: ["Bring a reference, we draw it your way", "Florals, tribal & butterflies", "Hand, back, waist & more"],
  },
  {
    key: "Fashion Braces",
    icon: Smile,
    src: "braces-silver",
    pos: "50% 50%",
    blurb: "Decorative braces in silver and black styles a quick, bold upgrade for your smile.",
    points: ["Silver & black chain styles", "Fitting and removal", "Cosmetic only — not orthodontic"],
  },
  {
    key: "Microblading",
    icon: Feather,
    src: "brows-crop",
    pos: "50% 50%",
    blurb: "Defined, natural-looking brows drawn hair by hair, so you wake up framed.",
    points: ["Semi-permanent brow shaping", "Shape designed around your face", "Pairs perfectly with lashes"],
  },
  {
    key: "Lip Blush",
    icon: Heart,
    src: "lips-crop",
    pos: "50% 50%",
    blurb: "A soft, even wash of colour that tints your lips from rosy nude to a statement berry.",
    points: ["Semi-permanent lip tint", "Choose your shade", "Natural to bold finish"],
  },
];

/* [file, w, h, category, caption] */
const GALLERY = [
  ["braces-purple", 1000, 1333, "braces", "Fashion braces with a bold lash set"],
  ["tattoo-spine", 720, 1117, "tattoos", "Celestial spine tattoo"],
  ["lash-braids", 720, 1055, "lashes", "Lashed — with golden braids"],
  ["braces-smile", 720, 1131, "braces", "Fashion braces & fresh lash set"],
  ["tattoo-butterfly", 720, 1104, "tattoos", "Butterflies with script"],
  ["anime-set", 720, 1171, "lashes", "Anime lash set"],
  ["rose-inked", 720, 1137, "tattoos", "Rose hand piece, mid-session"],
  ["lash-home", 720, 1010, "lashes", "Home service lash extensions"],
  ["braces-silver", 720, 1112, "braces", "Fashion braces in silver"],
  ["tattoo-tribal", 720, 1084, "tattoos", "Tribal-style lower-back piece"],
  ["lash-curtain", 720, 1160, "lashes", "Lashed"],
  ["braces-fitting", 720, 1149, "braces", "Fitting fashion braces"],
  ["lash-headwrap", 720, 1095, "lashes", "Lash extensions, enhanced look"],
  ["lips-brows", 720, 999, "lashes", "Lashes, brows & glossy lips"],
  ["lash-set", 720, 1055, "lashes", "Set ₦35k · bottom lash free"],
  ["lash-abuja", 720, 1040, "lashes", "Abuja lash bookings"],
  ["lash-promo", 720, 1052, "lashes", "Secure your slot"],
];
const FILTERS = [
  { id: "all", label: "All" },
  { id: "lashes", label: "Lashes" },
  { id: "tattoos", label: "Tattoos" },
  { id: "braces", label: "Fashion braces" },
];

const STEPS = [
  { icon: MessageCircle, title: "Message us", text: "Tap the WhatsApp button, tell us the service you want and send any reference photos." },
  { icon: Sparkle, title: "Pick your look", text: "We talk through style, shade or design, then lock in a slot that suits you." },
  { icon: MapPin, title: "Visit us in Abuja", text: "We confirm the exact location and time on WhatsApp. Lash clients can also ask for home service." },
  { icon: Check, title: "Walk out glowing", text: "Enjoy the result, then tag us on TikTok we love seeing the finished looks." },
];

const FAQ = [
  { q: "Which services do you offer?", a: "Lash extensions (fresh sets and removals), tattoo art, fashion braces, microblading and lip blush." },
  { q: "Where are you based?", a: `We're in ${CITY}. Message us on WhatsApp and we'll share the exact location and directions when your slot is confirmed.` },
  { q: "Do you offer home service?", a: "Yes — home-service lash extensions are available in Abuja. Message us to arrange a time." },
  { q: "How much is a lash set?", a: "Our recent promo is ₦35,000 for a full set with the bottom lash free. Prices for other services depend on the design — send photos and we'll quote you." },
  { q: "Are fashion braces orthodontic?", a: "No. Fashion braces are decorative and cosmetic — they don't straighten teeth. They're a fun, bold accessory for your smile." },
  { q: "How do I get the tattoo I have in mind?", a: "Send your reference images on WhatsApp along with the placement you want. We'll adapt the design to your body and agree it with you before we start." },
];

/* ====================================================================
   MOTION HELPERS
   ==================================================================== */
const EASE = [0.22, 1, 0.36, 1];
const reveal = (i = 0, y = 40) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12, margin: "0px 0px -40px 0px" },
  transition: { duration: 0.8, delay: Math.min(i * 0.09, 0.45), ease: EASE },
});

function Parallax({ children, amount = 36, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">{children}</motion.div>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub, light = false, align = "center" }) {
  return (
    <motion.div
      {...reveal(0)}
      className={`mb-10 max-w-2xl sm:mb-14 ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <p className={`eyebrow mb-4 ${light ? "!text-gold-300" : ""}`}>{eyebrow}</p>
      <h2 className={`font-display text-[2.4rem] font-medium leading-[1.02] sm:text-6xl ${light ? "text-cream-100" : ""}`}>
        {title}
      </h2>
      {sub && <p className={`mt-5 text-base leading-relaxed sm:text-lg ${light ? "text-cream-200/75" : "text-cocoa-700/80"}`}>{sub}</p>}
    </motion.div>
  );
}

function Logo({ dark = false }) {
  return (
    <span className="flex items-center gap-3">
      <img src="/logo-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
      <span className="leading-none">
        <span className={`block font-display text-[1.6rem] font-semibold tracking-wide ${dark ? "text-cream-100" : "text-cocoa-900"}`}>
          {BRAND}
        </span>
        <span className={`mt-0.5 block text-[0.6rem] uppercase tracking-[0.42em] ${dark ? "text-gold-300" : "text-gold-600"}`}>
          {CITY}
        </span>
      </span>
    </span>
  );
}

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-gold-500 via-gold-300 to-clay-500"
    />
  );
}

/* ====================================================================
   NAV
   ==================================================================== */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      el && io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-cream-100/90 shadow-[0_1px_0_rgba(43,27,20,0.08)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <a href="#top" onClick={(e) => goTo(e, "#top", () => setOpen(false))} aria-label={`${BRAND} home`}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => goTo(e, `#${n.id}`)}
              className={`relative text-sm tracking-wide transition-colors hover:text-gold-600 ${
                active === n.id ? "text-gold-600" : "text-cocoa-800"
              }`}
            >
              {n.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-gold-500 transition-all duration-300 ${
                  active === n.id ? "w-full" : "w-0"
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={wa()} target="_blank" rel="noreferrer" className="btn-dark hidden !px-5 !py-2.5 sm:inline-flex">
             Book Now
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-full border border-cocoa-900/15 text-cocoa-900 lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden border-t border-cocoa-900/10 lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 pb-6 pt-2 sm:px-8">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={(e) => goTo(e, `#${n.id}`, () => setOpen(false))}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="border-b border-cocoa-900/10 py-4 font-display text-2xl text-cocoa-900"
                >
                  {n.label}
                </motion.a>
              ))}
              <div className="flex justify-center">
                <a href={wa()} target="_blank" rel="noreferrer" className="btn-gold mt-5">
                 Book Now
              </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ====================================================================
   HERO — arch carousel
   ==================================================================== */
function HeroCarousel() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const n = HERO_SLIDES.length;

  const go = useCallback((d) => { setDir(d); setI((x) => (x + d + n) % n); }, [n]);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 4800);
    return () => clearInterval(t);
  }, [paused, go, i]);

  const s = HERO_SLIDES[i];
  return (
    <div
      className="relative mx-auto w-full max-w-[26rem] lg:max-w-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* decorative ring */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 animate-spinSlow rounded-full border border-dashed border-gold-500/50 sm:-right-10 sm:-top-10 sm:h-56 sm:w-56" />
      <div className="pointer-events-none absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-gold-300/40 blur-2xl sm:h-48 sm:w-48" />

      <motion.div
        className="arch relative aspect-[4/5] w-full overflow-hidden bg-cocoa-800 shadow-[0_40px_80px_-30px_rgba(43,27,20,0.55)]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) go(1);
          else if (info.offset.x > 50) go(-1);
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.img
            key={s.src}
            src={img(s.src)}
            alt={s.label}
            draggable={false}
            custom={dir}
            variants={{
              enter: (d) => ({ opacity: 0, x: d * 70, scale: 1.08 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (d) => ({ opacity: 0, x: d * -70, scale: 1.02 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute inset-0 h-full w-full select-none object-cover"
            style={{ objectPosition: s.pos }}
          />
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa-950/70 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-7">
          <div className="min-w-0">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold-300">
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="font-display text-2xl italic text-cream-100 sm:text-3xl"
              >
                {s.label}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => go(-1)} aria-label="Previous photo" className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-cocoa-900">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => go(1)} aria-label="Next photo" className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-cocoa-900">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* floating promo badge */}
      <motion.a
        href={wa("Hi Brownhaute! I saw the lash promo (set ₦35k, bottom lash free). Is it still available?")}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6, ease: EASE }}
        className="absolute -left-2 top-[18%] z-10 animate-bob rounded-2xl bg-cream-50 px-4 py-3 text-left shadow-[0_18px_40px_-14px_rgba(43,27,20,0.45)] sm:-left-8"
      >
        <span className="block text-[0.6rem] uppercase tracking-[0.25em] text-gold-600">Lash promo</span>
        <span className="block font-display text-2xl font-semibold leading-none text-cocoa-900">₦35k set</span>
        <span className="mt-0.5 block text-[0.7rem] text-cocoa-700">Bottom lash free</span>
      </motion.a>

      <div className="mt-6 flex justify-center gap-2">
        {HERO_SLIDES.map((_, k) => (
          <button
            key={k}
            onClick={() => { setDir(k > i ? 1 : -1); setI(k); }}
            aria-label={`Show photo ${k + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? "w-9 bg-gold-500" : "w-3 bg-cocoa-900/20 hover:bg-cocoa-900/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const h = (i) => ({
    initial: { opacity: 0, y: 36 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE },
  });
  return (
    <section id="top" className="relative overflow-hidden pt-24 sm:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-gold-300/25 blur-3xl" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pb-28">
        <div className="min-w-0">
          <motion.p {...h(0)} className="hidden md:block eyebrow mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" /> Beauty &amp; body art · {CITY}
          </motion.p>
          <motion.h1 {...h(1)} className="font-display text-[3.3rem] font-medium leading-[0.92] tracking-tight sm:text-7xl xl:text-[6.2rem]">
            Lashes.<br />Ink.<br />Braces.<br />
            <span className="italic text-gold-600">Brows &amp; lips.</span>
          </motion.h1>
          <motion.p {...h(2)} className="mt-6 max-w-lg text-base leading-relaxed text-cocoa-700 sm:text-lg">
            {BRAND} is a beauty and body-art brand lash extensions, hand-placed tattoos, fashion braces,
            microblading and lip blush. Message us on WhatsApp and we&apos;ll book your slot.
          </motion.p>
          <motion.div {...h(3)} className="mt-6 md:mt-9 flex flex-col gap-3 sm:flex-row">
            <div className="flex justify-center">
              <a href="#work" onClick={(e) => goTo(e, "#work")} className="btn-line">
              See the work <ArrowUpRight size={16} />
            </a>
            </div>
          </motion.div>
          <motion.ul {...h(4)} className="hidden md:block mt-1 flex flex-wrap gap-x-7 gap-y-3 text-sm text-cocoa-700">
            {["5 signature services", "Home-service lashes", "Book directly on WhatsApp"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check size={15} className="text-gold-600" /> {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.25, ease: EASE }} className="min-w-0">
          <HeroCarousel />
        </motion.div>
      </div>
    </section>
  );
}

/* ====================================================================
   MARQUEE
   ==================================================================== */
function Marquee() {
  const items = ["Lash Extensions", "Tattoo Art", "Fashion Braces", "Microblading", "Lip Blush", "Home-Service Lashes", "Abuja"];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-cocoa-900 py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {[...row, ...row].map((t, k) => (
          <span key={k} className="flex items-center gap-10 font-display text-2xl italic text-cream-200 sm:text-3xl">
            {t} <Sparkle size={14} className="text-gold-400" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================
   ABOUT
   ==================================================================== */
function About() {
  return (
    <section id="about" className="relative overflow-hidden py-14 md:py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4 sm:gap-5 lg:max-w-none">
          <Parallax amount={26} className="mt-10 sm:mt-14">
            <motion.div {...reveal(0)} className="arch aspect-[3/4.2] overflow-hidden">
              <img src={img("lash-headwrap")} alt="Lash extensions client with a red headwrap" loading="lazy" className="h-full w-full object-cover" />
            </motion.div>
          </Parallax>
          <Parallax amount={-26}>
            <motion.div {...reveal(1)} className="arch aspect-[3/4.2] overflow-hidden">
              <img src={img("rose-inked")} alt="Rose tattoo on a hand" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: "50% 55%" }} />
            </motion.div>
          </Parallax>
          <motion.div
            {...reveal(2)}
            className="hidden md:block absolute -bottom-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-cocoa-900 px-5 py-3 text-xs uppercase tracking-[0.25em] text-gold-300 shadow-xl sm:text-[0.7rem]"
          >
            Lashes · Ink · Braces · Brows · Lips
          </motion.div>
        </div>

        <div className="min-w-0">
          <SectionHead
            align="left"
            eyebrow="About us"
            title={<>Where beauty meets <span className="italic text-gold-600">body art.</span></>}
          />
          <motion.p {...reveal(1)} className="-mt-4 text-base leading-relaxed text-cocoa-700 sm:text-lg">
            From a fresh lash set and sculpted brows to a hand-placed tattoo or a pair of fashion braces,
            {" "}{BRAND} brings the full look together with quality, comfort and style.
          </motion.p>
          <motion.p {...reveal(2)} className="mt-5 text-base leading-relaxed text-cocoa-700 sm:text-lg">
            Everything is booked directly with us on WhatsApp, so you can share your inspiration, ask questions
            and get a slot without any back-and-forth. Lash clients can even request a home service.
          </motion.p>
          <motion.blockquote {...reveal(3)} className="mt-8 border-l-2 border-gold-500 pl-5">
            <p className="font-display text-2xl italic leading-snug text-cocoa-900 sm:text-3xl">
              “Fashion braces / lash extensions is the fastest way to enhance your physical appearance.”
            </p>
            <footer className="mt-3 text-xs uppercase tracking-[0.25em] text-gold-600">— {BRAND}</footer>
          </motion.blockquote>

          <div className="flex justify-center">
            <motion.a {...reveal(4)} href={wa()} target="_blank" rel="noreferrer" className="btn-gold mt-9 w-44 sm:w-auto">
             Chat with us
          </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   SERVICES — snap carousel
   ==================================================================== */
function Services() {
  const scroller = useRef(null);
  const [active, setActive] = useState(0);

  const stepSize = () => {
    const el = scroller.current;
    const card = el?.firstElementChild;
    return card ? card.getBoundingClientRect().width + 20 : 300;
  };
  const scrollBy = (d) => scroller.current?.scrollBy({ left: d * stepSize(), behavior: "smooth" });
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max > 0 && el.scrollLeft >= max - 4) return setActive(SERVICES.length - 1);
    setActive(Math.min(SERVICES.length - 1, Math.round(el.scrollLeft / stepSize())));
  };
  const toIndex = (k) => scroller.current?.scrollTo({ left: k * stepSize(), behavior: "smooth" });

  return (
    <section id="services" className="relative bg-cream-200/60 py-14 md:py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-4 md:mb-8 flex flex-col items-start justify-between gap-6 sm:mb-14 sm:flex-row sm:items-end">
          <SectionHead
            align="left"
            eyebrow="What we do"
            title={<>Five services, <span className="italic text-gold-600">one signature look.</span></>}
          />
          <div className="mb-10 hidden gap-3 sm:flex">
            <button onClick={() => scrollBy(-1)} aria-label="Previous service" className="grid h-12 w-12 place-items-center rounded-full border border-cocoa-900/25 transition hover:bg-cocoa-900 hover:text-cream-100">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Next service" className="grid h-12 w-12 place-items-center rounded-full border border-cocoa-900/25 transition hover:bg-cocoa-900 hover:text-cream-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          onScroll={onScroll}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:-mx-8 sm:px-8"
        >
          {SERVICES.map((s, k) => (
            <motion.article
              key={s.key}
              {...reveal(k, 50)}
              className="group flex w-[17.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] bg-cream-50 shadow-[0_20px_50px_-30px_rgba(43,27,20,0.5)] sm:w-[21rem]"
            >
              <div className="relative p-3 pb-0">
                <div className="arch relative aspect-[4/4.4] overflow-hidden">
                  <img
                    src={img(s.src)}
                    alt={s.key}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    style={{ objectPosition: s.pos }}
                  />
                  <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-cream-50/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-cocoa-800 backdrop-blur">
                    {String(k + 1).padStart(2, "0")}
                  </span>
                </div>
                <span className="absolute -bottom-5 right-8 grid h-12 w-12 place-items-center rounded-full bg-gold-500 text-white shadow-lg">
                  <s.icon size={20} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 pt-8">
                <h3 className="font-display text-3xl font-medium leading-none">{s.key}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cocoa-700">{s.blurb}</p>
                <ul className="mt-4 space-y-2 text-sm text-cocoa-800">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Check size={15} className="mt-0.5 shrink-0 text-gold-600" /> <span className="min-w-0 break-words">{p}</span>
                    </li>
                  ))}
                </ul>
                {s.tag && (
                  <p className="mt-2 rounded-xl bg-gold-300/25 px-3 py-2 text-xs font-medium text-gold-600">{s.tag}</p>
                )}
                <div className="flex justify-center">
                  <a
                  href={wa(`Hi ${BRAND}! I'd like to book ${s.key}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-dark mt-4 w-54 !py-3"
                >
                   Book {s.key}
                </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {SERVICES.map((s, k) => (
            <button
              key={s.key}
              onClick={() => toIndex(k)}
              aria-label={`Go to ${s.key}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${k === active ? "w-9 bg-gold-500" : "w-3 bg-cocoa-900/20"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   COMPARE — reference vs result
   ==================================================================== */
function Compare() {
  const [v, setV] = useState(60);
  const [touched, setTouched] = useState(false);
  return (
    <section id="design" className="relative overflow-hidden py-14 md:py-18 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="min-w-0 lg:order-2">
          <SectionHead
            align="left"
            eyebrow="From idea to skin"
            title={<>The design she wanted <span className="italic text-gold-600">vs. what we inked.</span></>}
          />
          <motion.p {...reveal(1)} className="-mt-4 text-base leading-relaxed text-cocoa-700 sm:text-lg">
            Got a tattoo you&apos;ve been dreaming about? Send us a reference and we&apos;ll bring it to life.
            Here&apos;s the piece inked on her hand (left) and the rose design she wanted (right)
            drag the handle to compare.
          </motion.p>
          <motion.ul {...reveal(2)} className="mt-6 space-y-3 text-cocoa-800">
            {["Share your reference on WhatsApp", "Tell us the placement you have in mind", "We draw it up and agree it with you first"].map((t) => (
              <li key={t} className="flex items-start gap-3"><Check size={18} className="mt-0.5 shrink-0 text-gold-600" /> {t}</li>
            ))}
          </motion.ul>
          <div className="flex justify-center">
            <motion.a
            {...reveal(3)}
            href={wa("Hi Brownhaute! I have a tattoo idea and a reference photo to share.")}
            target="_blank"
            rel="noreferrer"
            className="btn-gold mt-8 w-44 sm:w-auto"
          >
             Your tattoo idea
          </motion.a>
          </div>
        </div>

        <motion.div {...reveal(1, 50)} className="min-w-0 lg:order-1">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md select-none overflow-hidden rounded-[2rem] bg-cocoa-800 shadow-[0_40px_80px_-30px_rgba(43,27,20,0.6)]">
            <img src={img("rose-reference")} alt="Reference rose design" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 30%" }} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
              <img src={img("rose-inked")} alt="Finished rose tattoo on a hand" loading="lazy" draggable={false} className="h-full w-full object-cover" style={{ objectPosition: "50% 30%" }} />
            </div>
            <span className="absolute left-4 top-4 rounded-full bg-gold-500 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-white">Inked</span>
            <span className="absolute right-4 top-4 rounded-full bg-cocoa-950/75 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-cream-100 backdrop-blur">Reference</span>

            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" style={{ left: `${v}%`, transform: "translateX(-50%)" }}>
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-cocoa-900 shadow-xl">
                <MoveHorizontal size={20} />
              </span>
            </div>
            <AnimatePresence>
              {!touched && (
                <motion.span exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 bottom-5 mx-auto w-fit rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-cocoa-900">
                  Drag to compare
                </motion.span>
              )}
            </AnimatePresence>
            <input
              type="range"
              min="0"
              max="100"
              value={v}
              onChange={(e) => { setV(+e.target.value); setTouched(true); }}
              aria-label="Compare the reference design with the finished tattoo"
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ====================================================================
   GALLERY + LIGHTBOX
   ==================================================================== */
function Lightbox({ items, index, setIndex }) {
  const open = index !== null;
  const close = () => setIndex(null);
  const prev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length, setIndex]);
  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length, setIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open, prev, next, setIndex]);

  const it = open ? items[index] : null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-cocoa-950/95 p-4 backdrop-blur-md"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button onClick={close} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X size={22} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" className="absolute left-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6">
            <ChevronLeft size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="absolute right-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6">
            <ChevronRight size={24} />
          </button>
          <motion.figure
            key={it[0]}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => { if (info.offset.x < -70) next(); else if (info.offset.x > 70) prev(); }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full max-w-full flex-col items-center"
          >
            <img src={img(it[0])} alt={it[4]} draggable={false} className="max-h-[78vh] max-w-full rounded-2xl object-contain" />
            <figcaption className="mt-4 text-center text-sm text-cream-200">
              {it[4]} <span className="text-gold-300">· {index + 1}/{items.length}</span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Gallery() {
  const [filter, setFilter] = useState("all");
  const [lb, setLb] = useState(null);
  const items = filter === "all" ? GALLERY : GALLERY.filter((g) => g[3] === filter);

  return (
    <section id="work" className="relative bg-cocoa-900 py-14 md:py-20 text-cream-100 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHead light eyebrow="The gallery" title={<>Real work, <span className="italic text-gold-300">real glow.</span></>} sub="A look at recent lashes, tattoos and fashion braces. Tap any photo to view it full size." />

        <motion.div {...reveal(0)} className="scrollbar-none -mx-4 mb-10 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm transition ${
                filter === f.id ? "border-gold-400 bg-gold-400 text-cocoa-950" : "border-white/20 text-cream-200 hover:border-gold-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        <div key={filter} className="columns-2 gap-3 sm:gap-5 lg:columns-3 xl:columns-4">
          {items.map((g, k) => (
            <motion.button
              key={g[0]}
              {...reveal(k % 4, 30)}
              onClick={() => setLb(k)}
              className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl sm:mb-5"
              aria-label={`View: ${g[4]}`}
            >
              <img
                src={img(g[0])}
                alt={g[4]}
                width={g[1]}
                height={g[2]}
                loading="lazy"
                className="h-auto w-full transition-transform duration-[900ms] group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-cocoa-950/80 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-4">
                <span className="text-left text-xs text-cream-100 sm:text-sm">{g[4]}</span>
              </span>
            </motion.button>
          ))}
        </div>

        <motion.div {...reveal(0)} className="mt-8 md:mt-10 text-center">
          <a href={TIKTOK} target="_blank" rel="noreferrer" className="btn-line !border-white/25 !text-cream-100 hover:!bg-white/10">
            <FaTiktok size={16} /> More on TikTok {TIKTOK_HANDLE}
          </a>
        </motion.div>
      </div>
      <Lightbox items={items} index={lb} setIndex={setLb} />
    </section>
  );
}

/* ====================================================================
   PROMO BAND
   ==================================================================== */
function Promo() {
  return (
    <section className="grain relative overflow-hidden bg-gradient-to-br from-gold-400 via-gold-500 to-clay-500 py-10 md:py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="min-w-0 text-cocoa-950">
          <motion.p {...reveal(0)} className="mb-4 text-[0.72rem] font-medium uppercase tracking-[0.32em]">Lash promo</motion.p>
          <motion.h2 {...reveal(1)} className="font-display text-5xl font-medium leading-[0.95] sm:text-7xl">
            Full set <span className="italic">₦35,000.</span><br />Bottom lash <span className="italic">free.</span>
          </motion.h2>
          <motion.p {...reveal(2)} className="mt-6 max-w-lg text-base text-cocoa-900/85 sm:text-lg">
            Hesitate too long and someone else takes your slot promos don&apos;t last forever. Message us to confirm the
            current offer and secure your date.
          </motion.p>

          <div className="flex justify-center">
            <motion.a
            {...reveal(3)}
            href={wa("Hi Brownhaute! I want to secure a lash slot with the ₦35k promo.")}
            target="_blank"
            rel="noreferrer"
            className="btn-dark mt-8 w-44 sm:w-auto"
          >
             Secure my slot
          </motion.a>
          </div>
        </div>
        <motion.div {...reveal(2, 50)} className="mx-auto w-full max-w-[16rem] md:max-w-none">
          <div className="arch aspect-[3/4] overflow-hidden border-[6px] border-cream-100/80 shadow-2xl">
            <img src={img("lash-set")} alt="Lash set promo" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: "50% 35%" }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ====================================================================
   PROCESS
   ==================================================================== */
function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  return (
    <section id="process" className="py-14 md:py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <SectionHead eyebrow="How to book" title={<>Booking is <span className="italic text-gold-600">effortless.</span></>} sub="Four simple steps from first message to finished look." />
        <div ref={ref} className="relative">
          <div className="absolute bottom-0 left-6 top-0 w-px bg-cocoa-900/10 sm:left-1/2" />
          <motion.div style={{ scaleY }} className="absolute bottom-0 left-6 top-0 w-px origin-top bg-gold-500 sm:left-1/2" />
          <div className="space-y-10 sm:space-y-14">
            {STEPS.map((s, k) => (
              <motion.div
                key={s.title}
                {...reveal(0, 40)}
                className={`relative flex items-start gap-5 pl-0 sm:w-1/2 sm:gap-6 ${k % 2 ? "sm:ml-auto sm:flex-row sm:pl-10" : "sm:flex-row-reverse sm:pr-10 sm:text-right"}`}
              >
                <span className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cocoa-900 text-gold-300 ring-8 ring-cream-100 sm:absolute sm:top-0 ${k % 2 ? "sm:-left-6" : "sm:-right-6"}`}>
                  <s.icon size={20} />
                </span>
                <div className="min-w-0 pt-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gold-600">Step {k + 1}</p>
                  <h3 className="mt-1 font-display text-3xl font-medium">{s.title}</h3>
                  <p className="mt-2 text-cocoa-700">{s.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   FAQ
   ==================================================================== */
function FAQItem({ q, a, i }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div {...reveal(i, 24)} className="border-b border-cocoa-900/15">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span className="min-w-0 font-display text-xl font-medium sm:text-2xl">{q}</span>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cocoa-900/25 transition-transform duration-300 ${open ? "rotate-45 bg-cocoa-900 text-cream-100" : ""}`}>
          <Plus size={16} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <p className="pb-5 pr-12 leading-relaxed text-cocoa-700">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
function FAQSection() {
  return (
    <section id="faq" className="bg-cream-200/60 py-10 md:py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <SectionHead eyebrow="Good to know" title={<>Questions, <span className="italic text-gold-600">answered.</span></>} />
        <div className="border-t border-cocoa-900/15">
          {FAQ.map((f, k) => <FAQItem key={f.q} {...f} i={k} />)}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   CONTACT
   ==================================================================== */
function Contact() {
  const rows = [
    { icon: FaWhatsapp, label: "WhatsApp", value: PHONE_DISPLAY, href: wa() },
    { icon: Phone, label: "Call", value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
    { icon: FaTiktok, label: "TikTok", value: TIKTOK_HANDLE, href: TIKTOK },
    { icon: MapPin, label: "Location", value: `${CITY}, Nigeria`, href: MAP_LINK },
  ];
  return (
    <section id="contact" className="relative overflow-hidden py-10 md:py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="min-w-0">
          <SectionHead align="left" eyebrow="Contact" title={<>Let&apos;s book <span className="italic text-gold-600">your slot.</span></>} sub="Message us on WhatsApp with the service you want and your reference photos. We reply with available dates and the exact location." />
          <div className="space-y-3">
            {rows.map((r, k) => (
              <motion.a
                key={r.label}
                {...reveal(k, 24)}
                href={r.href}
                target={r.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex min-w-0 items-center gap-4 rounded-2xl border border-cocoa-900/10 bg-cream-50 p-4 transition hover:border-gold-500 hover:shadow-lg"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cocoa-900 text-gold-300 transition group-hover:bg-gold-500 group-hover:text-white">
                  <r.icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.65rem] uppercase tracking-[0.25em] text-gold-600">{r.label}</span>
                  <span className="block truncate font-display text-xl font-medium sm:text-2xl">{r.value}</span>
                </span>
                <ArrowUpRight size={18} className="shrink-0 text-cocoa-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.a>
            ))}
          </div>
          <motion.div {...reveal(4, 24)} className="mt-6 flex flex-col gap-3 sm:flex-row">

            
            <div className="flex justify-center">
              <a href={`tel:${PHONE_TEL}`} className="btn-line"><Phone size={16} /> Call now</a>
            </div>
          </motion.div>
          <p className="mt-5 flex items-center gap-2 text-sm text-cocoa-700"><Home size={15} className="shrink-0 text-gold-600" /> Home-service lash extensions available in Abuja.</p>
        </div>

        <motion.div {...reveal(1, 50)} className="min-w-0">
          <div className="overflow-hidden rounded-[2rem] border border-cocoa-900/10 bg-cream-200 shadow-[0_30px_70px_-35px_rgba(43,27,20,0.55)]">
            <iframe
              title={`${BRAND} location in ${CITY} on Google Maps`}
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[22rem] w-full border-0 sm:h-[30rem]"
            />
            <div className="flex flex-col items-start justify-between gap-3 bg-cream-50 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-display text-xl font-medium">{BRAND} · {CITY}</p>
                <p className="text-sm text-cocoa-700">We share the exact address when you book.</p>
              </div>
              <a href={MAP_LINK} target="_blank" rel="noreferrer" className="btn-dark shrink-0 !py-2.5">
                <MapPin size={15} /> Open in Maps
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ====================================================================
   FOOTER + FAB
   ==================================================================== */
function Footer() {
  return (
    <footer className="bg-cocoa-950 text-cream-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <Logo dark />
          <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => goTo(e, `#${n.id}`)} className="transition hover:text-gold-300">{n.label}</a>
            ))}
          </nav>
          <div className="flex gap-3">
            <a href={wa()} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition hover:border-gold-400 hover:text-gold-300"><FaWhatsapp size={18} /></a>
            <a href={TIKTOK} target="_blank" rel="noreferrer" aria-label="TikTok" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition hover:border-gold-400 hover:text-gold-300"><FaTiktok size={16} /></a>
            <a href={`tel:${PHONE_TEL}`} aria-label="Call" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition hover:border-gold-400 hover:text-gold-300"><Phone size={17} /></a>
          </div>
        </div>

        {/* Builder Credit */}
        <p className="mt-6 text-xs sm:text-sm opacity-80 flex items-center justify-center gap-2">
          <img
              src="/logos.jpg"
              alt="Elvionweb Logo"
              className="w-8 h-8 object-contain"
          />
          Built by{" "}
          <a
            href="https://www.elvionweb.com"
        target="_blank"
          rel="noopener noreferrer"
        className="font-semibold underline underline-offset-4 hover:opacity-100 transition-opacity"
          >
          Elvionweb
          </a>
          </p>

        <div className="mt-6 md:mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-cream-200/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
          <p>Lashes · Tattoos · Fashion braces · Microblading · Lip blush — {CITY}, Nigeria</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  return (
    <a
      href={wa()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Brownhaute on WhatsApp"
      className="group fixed bottom-5 right-4 z-40 flex items-center gap-3 sm:bottom-7 sm:right-7"
    >
      <span className="hidden rounded-full bg-cocoa-900 px-4 py-2 text-sm text-cream-100 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 sm:block">Book Now</span>
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-6px_rgba(37,211,102,0.65)]">
        <span className="absolute inset-0 animate-pulseRing rounded-full bg-[#25D366]" />
        <FaWhatsapp size={28} className="relative" />
      </span>
    </a>
  );
}

/* ====================================================================
   APP
   ==================================================================== */
export default function App() {
  return (
    <>
      <ProgressBar />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Compare />
        <Gallery />
        <Promo />
        <Process />
        <FAQSection />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
