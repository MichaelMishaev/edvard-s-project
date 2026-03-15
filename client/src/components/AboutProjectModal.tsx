import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  emoji: string;
  title: string;
  body: string;
  bgColor: string;
}

const SLIDES: Slide[] = [
  {
    emoji: "🧠",
    title: "חשיבה ותכנון עם ChatGPT",
    body: "ישבתי עם ChatGPT וחשבנו יחד על הרעיון — מה יהיה במשחק ואיך הוא יעבוד.",
    bgColor: "bg-purple-500/20",
  },
  {
    emoji: "📋",
    title: "קובץ MD — תוכנית הפרויקט",
    body: "כתבתי את כל הרעיונות בקובץ Markdown. זה כמו מחברת דיגיטלית — המפה שלי לאורך הפרויקט.",
    bgColor: "bg-blue-500/20",
  },
  {
    emoji: "🤖",
    title: "Claude Code — בונה הקוד",
    body: "עוזר AI שכותב קוד. נתתי לו את התוכנית שלי ויחד בנינו את כל האתר.",
    bgColor: "bg-orange-500/20",
  },
  {
    emoji: "🚀",
    title: "Antigravity — כלי הפיתוח",
    body: "לוח הבקרה שדרכו עבדתי עם Claude Code — כותב קוד בזמן אמת לפי ההוראות שלי.",
    bgColor: "bg-cyan-500/20",
  },
  {
    emoji: "🗄️",
    title: "מסד נתונים — הזיכרון",
    body: "שומר שמות, ניקודים ותגים של כל השחקנים — כמו טבלת אקסל שגרה בשרת.",
    bgColor: "bg-green-500/20",
  },
  {
    emoji: "☁️",
    title: "GitHub — הענן שלנו",
    body: "כל הקוד שמור ב-GitHub — כמו Google Drive לקוד, עם גיבוי וגרסאות ישנות.",
    bgColor: "bg-slate-500/20",
  },
  {
    emoji: "⚛️",
    title: "React — שפת האתר",
    body: "האתר כתוב ב-React. בנוי מ'קומפוננטות' כמו לגו — כפתורים, כרטיסים ועמודים שמתחברים יחד.",
    bgColor: "bg-sky-500/20",
  },
  {
    emoji: "🎨",
    title: "Ideogram AI — יוצר התמונות",
    body: "כל התמונות במשחק נוצרו על ידי Ideogram AI — נתתי תיאור בעברית והוא ציייר תוך שניות.",
    bgColor: "bg-pink-500/20",
  },
];

interface Props {
  onClose: () => void;
}

export default function AboutProjectModal({ onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const next = () => {
    if (current < SLIDES.length - 1) goTo(current + 1);
  };

  const prev = () => {
    if (current > 0) goTo(current - 1);
  };

  const slide = SLIDES[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 start-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          aria-label="סגור"
        >
          ✕
        </button>

        {/* Header image */}
        <img
          src="/images/ui/how-i-built-it.png"
          alt="איך בניתי את זה"
          className="h-40 w-full object-cover"
        />

        {/* Header */}
        <div className="px-6 pt-3 pb-2 text-center">
          <h2 className="text-lg font-extrabold text-white">🛠️ איך בניתי את זה?</h2>
          <p className="mt-0.5 text-xs text-white/50">{current + 1} / {SLIDES.length}</p>
        </div>

        {/* Slide area */}
        <div className="relative overflow-hidden px-6 pb-4" style={{ minHeight: 260 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ x: direction * 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -80, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4 text-center"
            >
              {/* Emoji circle */}
              <div className={`flex h-24 w-24 items-center justify-center rounded-full ${slide.bgColor} border border-white/10`}>
                <span className="text-5xl leading-none" role="img" aria-hidden="true">{slide.emoji}</span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-extrabold text-white leading-tight">{slide.title}</h3>

              {/* Body */}
              <p className="text-sm text-white/75 leading-relaxed">{slide.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-5">
          {/* Prev */}
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
            aria-label="הקודם"
          >
            ▶
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`מעבר לשקופית ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === current ? "w-5 bg-blue-400" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
            aria-label="הבא"
          >
            ◀
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
