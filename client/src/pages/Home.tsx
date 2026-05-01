import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Stat card with count-up ─────────────────────────────────────────────────
function StatCard({ value, suffix, label, sub }: { value: number; suffix: string; label: string; sub: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCountUp(value, 1600, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="rounded-xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-400/40 transition-colors"
    >
      <div className="text-5xl font-bold text-blue-400 font-[Space_Grotesk]">
        {count}{suffix}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{label}</div>
      <div className="mt-1 text-sm text-white/50">{sub}</div>
    </motion.div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-20 ${className}`}>
      <div className="container max-w-6xl mx-auto px-6">{children}</div>
    </section>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3 border border-blue-400/30 px-3 py-1 rounded-full">
        {tag}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-white/60 text-lg max-w-2xl">{subtitle}</p>}
    </motion.div>
  );
}

// Resolve an absolute public path against Vite's BASE_URL so images work under
// any deploy prefix (e.g. GitHub Pages /covid-depression-research/).
function asset(src: string) {
  return src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;
}

// ─── Figure card ──────────────────────────────────────────────────────────────
function FigureCard({ src: rawSrc, caption, num }: { src: string; caption: string; num: number }) {
  const src = asset(rawSrc);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <motion.figure
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="rounded-xl overflow-hidden border border-white/10 bg-white/5"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          aria-label={`Expand Figure ${num}: ${caption}`}
        >
          <img
            src={src}
            alt={caption}
            className="w-full object-contain bg-white p-2 transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </button>
        <figcaption className="px-4 py-3 text-sm text-white/60">
          <span className="text-blue-400 font-semibold">Figure {num}.</span> {caption}
        </figcaption>
      </motion.figure>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Figure ${num} expanded`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            ×
          </button>
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={caption}
              className="max-w-full max-h-[85vh] object-contain rounded-lg bg-white"
            />
            <figcaption className="text-sm text-white/70 text-center max-w-3xl px-4">
              <span className="text-blue-400 font-semibold">Figure {num}.</span> {caption}
            </figcaption>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

// ─── Nav link ─────────────────────────────────────────────────────────────────
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="text-sm text-white/60 hover:text-white transition-colors font-medium">
      {label}
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A1628]/95 backdrop-blur-md border-b border-white/10 shadow-xl" : "bg-transparent"}`}>
        <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-white text-sm tracking-wide font-[Space_Grotesk]">COVID-19 & Depression</span>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#background" label="Background" />
            <NavLink href="#data" label="Data" />
            <NavLink href="#results" label="Results" />
            <NavLink href="#conclusion" label="Conclusion" />
            <NavLink href="#references" label="References" />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0D1F3C] to-[#071020]" />
        {/* Decorative glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-6 relative z-10 pt-24 pb-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-cyan-400 mb-6 border border-cyan-400/30 px-3 py-1 rounded-full">
              Research Paper · INFM 316 · Mercer University
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white max-w-4xl">
              The Prevalence of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Depression
              </span>{" "}
              During the COVID-19 Outbreak
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
              A data-driven analysis of depression prevalence across 12 community-based studies spanning six countries, examining assessment tools, demographic disparities, and policy implications.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#data" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm">
                Explore the Data →
              </a>
              <a href="#conclusion" className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm">
                View Recommendations
              </a>
            </div>
            <div className="mt-6 text-sm text-white/40">
              Brian L. Moore &nbsp;·&nbsp; Dr. Maxine Harlemon &nbsp;·&nbsp; April 2026
            </div>
          </motion.div>

          {/* Stat strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={12} suffix="" label="Studies Analyzed" sub="Across 6 countries" />
            <StatCard value={25} suffix="%" label="Pooled Prevalence" sub="Bueno-Notivol et al., 2021" />
            <StatCard value={6} suffix="" label="Assessment Tools" sub="BDI-II, WHO-5, CES-D, DASS-21, PHQ-9, SDS" />
            <StatCard value={7} suffix="/9" label="Avg. Quality Score" sub="JBI Critical Appraisal" />
          </div>
        </div>
      </header>

      {/* ── Background ── */}
      <Section id="background" className="border-t border-white/10">
        <SectionHeading
          tag="Background"
          title="Literature Review"
          subtitle="Three foundational studies provide the evidence base for this research."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              authors: "Bueno-Notivol et al.",
              year: "2021",
              journal: "Int. J. Clinical & Health Psychology",
              summary: "A meta-analysis of community-based studies found a pooled depression prevalence of 25% during the COVID-19 outbreak — approximately seven times higher than pre-pandemic estimates. Wide variation across studies (7.4%–48.3%) was attributed to differences in assessment tools and sampling methods.",
              color: "blue",
            },
            {
              authors: "Nalbandian et al.",
              year: "2021",
              journal: "Nature Medicine",
              summary: "Documented post-acute COVID-19 syndrome, including persistent neuropsychiatric symptoms such as depression, anxiety, and cognitive impairment lasting weeks to months after infection. This established that the mental health burden extends well beyond the acute phase.",
              color: "cyan",
            },
            {
              authors: "Ritchie, Chan & Watermeyer",
              year: "2020",
              journal: "Brain Communications",
              summary: "Introduced the concept of 'collateral damage' — the cognitive and psychological consequences of pandemic-related societal disruption, including isolation, grief, and economic stress — as distinct from direct neurological effects of SARS-CoV-2 infection.",
              color: "teal",
            },
          ].map((item) => (
            <motion.div
              key={item.authors}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/30 transition-colors"
            >
              <div className={`text-xs font-semibold tracking-widest uppercase mb-3 ${item.color === "blue" ? "text-blue-400" : item.color === "cyan" ? "text-cyan-400" : "text-teal-400"}`}>
                {item.journal}
              </div>
              <h3 className="text-lg font-bold text-white">{item.authors} ({item.year})</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">{item.summary}</p>
            </motion.div>
          ))}
        </div>

        {/* Additional refs */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {[
            {
              authors: "Waszkiewicz",
              year: "2021",
              journal: "Journal of Clinical Medicine",
              summary: "Identified biological biomarkers of post-COVID depression, including elevated inflammatory cytokines (IL-6, TNF-α), disrupted HPA axis activity, and serotonin pathway dysregulation — providing a neurobiological basis for the elevated depression rates observed in COVID-19 survivors.",
            },
            {
              authors: "Finsterer",
              year: "2025",
              journal: "European Archives of Psychiatry and Clinical Neuroscience",
              summary: "Argued that post-COVID depression is multicausal and cannot be attributed solely to SARS-CoV-2 infection. Confounding factors including pre-existing mental health conditions, socioeconomic stressors, grief, and pandemic-related isolation must be accounted for in epidemiological analyses.",
            },
          ].map((item) => (
            <motion.div
              key={item.authors}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/30 transition-colors"
            >
              <div className="text-xs font-semibold tracking-widest uppercase mb-3 text-purple-400">{item.journal}</div>
              <h3 className="text-lg font-bold text-white">{item.authors} ({item.year})</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">{item.summary}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Data ── */}
      <Section id="data" className="bg-white/[0.02] border-t border-white/10">
        <SectionHeading
          tag="Data"
          title="Dataset Overview"
          subtitle="12 community-based studies evaluated using the JBI Critical Appraisal instrument."
        />

        {/* Dataset table image */}
        <FigureCard
          src="/Rplot07.png"
          caption="COVID-19 Depression Case Study Table — 12 studies across China, India, Italy, Vietnam, UK, and Denmark."
          num={1}
        />

        <div className="mt-8 max-w-md mx-auto">
          <FigureCard
            src="/Rplot11.png"
            caption="Legend: Column and Sampling Method Abbreviations used in the dataset."
            num={2}
          />
        </div>

        {/* Assessment tools */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6">Assessment Tools Used</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { abbr: "BDI-II", name: "Beck Depression Inventory – 2nd Ed.", desc: "21-item self-report scale measuring depressive symptom severity. Widely used in clinical and research settings.", studies: 1 },
              { abbr: "WHO-5", name: "WHO Five Well-Being Index", desc: "5-item scale measuring positive well-being. Scores ≤50 indicate poor well-being and risk of depression.", studies: 2 },
              { abbr: "CES-D", name: "Center for Epidemiologic Studies – Depression", desc: "20-item scale designed for epidemiological research, measuring depressive symptoms in general populations.", studies: 1 },
              { abbr: "DASS-21", name: "Depression, Anxiety and Stress Scales", desc: "21-item scale measuring three negative emotional states: depression, anxiety, and stress.", studies: 3 },
              { abbr: "PHQ-9", name: "Patient Health Questionnaire – 9", desc: "9-item scale based on DSM-IV criteria. Widely used in primary care for depression screening.", studies: 3 },
              { abbr: "SDS", name: "Sheehan Disability Scale", desc: "3-item scale assessing functional impairment in work, social life, and family. Used as a proxy for depression severity.", studies: 2 },
            ].map((tool) => (
              <motion.div
                key={tool.abbr}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="rounded-lg border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-lg font-bold text-blue-400 font-[Space_Grotesk]">{tool.abbr}</span>
                  <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{tool.studies} {tool.studies === 1 ? "study" : "studies"}</span>
                </div>
                <div className="text-sm font-semibold text-white/80 mb-1">{tool.name}</div>
                <p className="text-xs text-white/50 leading-relaxed">{tool.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quality scores */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-xl font-bold text-white mb-2">JBI Quality Score Summary</h3>
          <p className="text-white/60 text-sm mb-6">All 12 studies evaluated using the Joanna Briggs Institute standardized critical appraisal instrument (9 criteria).</p>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Studies Assessed", value: "12" },
              { label: "Mean Score", value: "6.67 / 9" },
              { label: "Median Score", value: "7 / 9" },
              { label: "Std. Deviation", value: "0.49" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-cyan-400 font-[Space_Grotesk]">{s.value}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed study table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 px-3 text-white font-semibold">Study</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <th key={n} className="text-center py-2 px-2 text-white/60 text-xs">{n}</th>
                  ))}
                  <th className="text-center py-2 px-2 text-white font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { study: "Ahmed et al. (2020)", scores: "N N Y Y Y Y Y Y U", total: 6 },
                  { study: "Gao et al. (2020)", scores: "N N Y Y Y Y Y Y Y", total: 7 },
                  { study: "Huang & Zhao (2020)", scores: "N N Y Y Y Y Y Y Y", total: 7 },
                  { study: "Kazmi et al. (2020)", scores: "N Y Y N Y Y Y Y N", total: 6 },
                  { study: "Lei et al. (2020)", scores: "N N Y Y Y Y Y Y Y", total: 7 },
                  { study: "Mazza et al. (2020)", scores: "N N Y Y Y Y Y Y Y", total: 7 },
                  { study: "Nguyen et al. (2020)", scores: "N N Y Y Y Y Y Y U", total: 6 },
                  { study: "Ni et al. (2020)", scores: "N N Y Y Y Y Y Y U", total: 6 },
                  { study: "Shevlin et al. (2020)", scores: "Y N Y Y Y Y Y Y U", total: 7 },
                  { study: "Sonderskov et al. (2020)", scores: "Y N Y Y Y Y Y Y U", total: 7 },
                  { study: "Wang, Pan, Wan, Tan, Xu, Ho et al. (2020)", scores: "N N Y Y Y Y Y Y Y", total: 7 },
                  { study: "Wang, Di, et al. (2020)", scores: "N N Y Y Y Y Y Y Y", total: 7 },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 text-white/80 text-xs font-medium">{row.study}</td>
                    {row.scores.split(" ").map((score, i) => (
                      <td
                        key={i}
                        className={`text-center py-2 px-2 text-xs font-semibold ${score === "Y"
                          ? "text-green-400"
                          : score === "N"
                            ? "text-red-400"
                            : "text-yellow-400"
                          }`}
                      >
                        {score}
                      </td>
                    ))}
                    <td className="text-center py-2 px-2 text-white font-bold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* JBI Criteria definitions */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <h4 className="text-sm font-bold text-white mb-4">JBI Criteria Definitions (N=No, U=Unclear, Y=Yes)</h4>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-white/70 leading-relaxed">
              <div>
                <div className="font-semibold text-white mb-2">1. Was the sample frame appropriate to address the target population?</div>
                <p>Was the sampling frame suitable for identifying all members of the target population?</p>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">2. Study participants recruited appropriately?</div>
                <p>Were study participants recruited in an appropriate way using random or systematic sampling?</p>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">3. Sample size adequate?</div>
                <p>Was the sample size adequate for the study design and statistical analysis?</p>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">4. Study subjects and setting described in detail?</div>
                <p>Were study subjects and setting described sufficiently to allow replication?</p>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">5. Data analysis with sufficient sample coverage?</div>
                <p>Was data analysis conducted with sufficient coverage of the identified sample?</p>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">6. Valid methods for condition identification?</div>
                <p>Were valid methods used for the identification of the condition being studied?</p>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">7. Condition measured in standard, reliable way?</div>
                <p>Was the condition measured in a standard, reliable way for all participants?</p>
              </div>
              <div>
                <div className="font-semibold text-white mb-2">8. Appropriate statistical analysis?</div>
                <p>Was there appropriate statistical analysis of the data?</p>
              </div>
              <div className="md:col-span-2">
                <div className="font-semibold text-white mb-2">9. Response rate adequate, and if not, managed appropriately?</div>
                <p>Was the response rate adequate, and if not, was the low response rate managed appropriately?</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/60 leading-relaxed">
            Scores ranged from 6 to 7 with a very narrow standard deviation of 0.49, indicating that the included studies were consistently high quality. This tight clustering adds credibility to the pooled findings and reduces the risk that methodological inconsistency alone explains the wide variation in reported prevalence.
          </p>
        </div>
      </Section>

      {/* ── Results ── */}
      <Section id="results" className="border-t border-white/10">
        <SectionHeading
          tag="Results"
          title="Data Analysis & Findings"
          subtitle="Visual exploration of depression prevalence across assessment tools, regions, and demographics."
        />

        {/* Violin plot */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-4">Depression Prevalence by Assessment Tool</h3>
          <FigureCard
            src="/Rplot01.png"
            caption="Violin plot showing the distribution of depression prevalence by assessment tool across all 12 studies."
            num={3}
          />
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h4 className="font-semibold text-white mb-3">Key Findings</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-white/70 leading-relaxed">
              <p><span className="text-blue-400 font-semibold">WHO-5</span> produced the highest and most variable estimates (mean 36.85%, range 25.4%–48.3%), reflecting its broader well-being focus rather than clinical depression criteria.</p>
              <p><span className="text-blue-400 font-semibold">DASS-21</span> yielded consistently elevated estimates (mean 33.97%), likely because it captures anxiety and stress alongside depression.</p>
              <p><span className="text-blue-400 font-semibold">PHQ-9</span> showed the widest spread (7.4%–34%), suggesting high sensitivity to population and setting differences.</p>
              <p><span className="text-blue-400 font-semibold">SDS</span> produced the lowest and tightest estimates (mean 15.95%), reflecting its focus on functional impairment rather than symptom frequency.</p>
            </div>
          </div>
        </div>

        {/* Global maps */}
        <div className="mb-10 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Global Prevalence Map</h3>
            <FigureCard
              src="/Rplot.png"
              caption="Choropleth map of global depression prevalence by country (color scale: 3–7)."
              num={4}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Distribution by Continental Region</h3>
            <FigureCard
              src="/Rplot02.png"
              caption="Ridgeline plot showing distribution of depression prevalence by WHO continental region."
              num={5}
            />
          </div>
        </div>

        {/* Summary statistics table by continental region (Rplot12) */}
        <div className="mb-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-bold text-white mb-2">Depression Prevalence Distribution by Continental Region</h3>
          <p className="text-sm text-white/60 mb-6">
            Summary statistics underlying the choropleth (Figure 4) and ridgeline plot (Figure 5), aggregated by WHO region.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 px-3 text-white font-semibold">Parent Location</th>
                  <th className="text-right py-2 px-3 text-white/80 font-semibold">Mean</th>
                  <th className="text-right py-2 px-3 text-white/80 font-semibold">Median</th>
                  <th className="text-right py-2 px-3 text-white/80 font-semibold">Min</th>
                  <th className="text-right py-2 px-3 text-white/80 font-semibold">Max</th>
                  <th className="text-right py-2 px-3 text-white/80 font-semibold">SD</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { region: "Western Pacific", mean: 3.78, median: 3.60, min: 2.90, max: 5.90, sd: 0.78 },
                  { region: "South-East Asia", mean: 3.86, median: 3.90, min: 3.00, max: 4.50, sd: 0.49 },
                  { region: "Africa", mean: 4.10, median: 4.10, min: 3.40, max: 4.90, sd: 0.36 },
                  { region: "Eastern Mediterranean", mean: 4.36, median: 4.50, min: 3.30, max: 5.10, sd: 0.59 },
                  { region: "Americas", mean: 4.76, median: 4.70, min: 3.70, max: 5.90, sd: 0.49 },
                  { region: "Europe", mean: 4.98, median: 5.00, min: 3.80, max: 6.30, sd: 0.48 },
                ].map((row) => (
                  <tr key={row.region} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 text-white/80 font-medium">{row.region}</td>
                    <td className="text-right py-2 px-3 text-cyan-400 font-semibold">{row.mean.toFixed(2)}</td>
                    <td className="text-right py-2 px-3 text-white/70">{row.median.toFixed(2)}</td>
                    <td className="text-right py-2 px-3 text-white/70">{row.min.toFixed(2)}</td>
                    <td className="text-right py-2 px-3 text-white/70">{row.max.toFixed(2)}</td>
                    <td className="text-right py-2 px-3 text-white/70">{row.sd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption className="mt-3 text-xs text-white/50">
            <span className="text-blue-400 font-semibold">Figure 6.</span> Mean, median, range, and standard deviation of depression prevalence by WHO continental region.
          </figcaption>
        </div>

        <div className="mb-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/70 leading-relaxed">
            The summary statistics confirm what the choropleth and ridgeline plots suggest visually: <span className="text-cyan-400 font-semibold">Europe (mean 4.98)</span> and <span className="text-cyan-400 font-semibold">the Americas (mean 4.76)</span> recorded the highest average depression prevalence, while the <span className="text-cyan-400 font-semibold">Western Pacific (mean 3.78)</span> and <span className="text-cyan-400 font-semibold">South-East Asia (mean 3.86)</span> sat at the low end. Spread tells a different story than central tendency: the <span className="text-cyan-400 font-semibold">Western Pacific has by far the widest distribution (SD 0.78, range 2.90–5.90)</span>, reflecting heterogeneous outcomes between countries like Vietnam and China, whereas <span className="text-cyan-400 font-semibold">Africa is the tightest (SD 0.36)</span>. Europe combines a high mean with the highest single-country maximum (6.30), consistent with the warm-tone clusters visible across Western Europe in the choropleth.
          </p>
        </div>

        {/* Vietnam breakdowns */}
        <h3 className="text-xl font-bold text-white mb-6">Vietnam Case Study: Demographic Breakdowns</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <FigureCard
            src="/Rplot03.png"
            caption="Depression prevalence by location (Rural vs. Urban) in Vietnam — mild, moderate, and severe."
            num={7}
          />
          <FigureCard
            src="/Rplot04.png"
            caption="Depression prevalence by gender in Vietnam — mild, moderate, and severe."
            num={8}
          />
          <FigureCard
            src="/Rplot05.png"
            caption="Depression prevalence by profession in Vietnam — mild, moderate, and severe."
            num={9}
          />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
          <p className="text-xs text-white/50 mb-4 italic">
            Note: values below are <span className="text-white/70 font-semibold">prevalence scores</span> from the source dataset, not percentages of total respondents (mild/moderate/severe values within a group do not sum to 100).
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-white/70 leading-relaxed">
            <div>
              <div className="text-blue-400 font-semibold mb-2">Location (Urban vs. Rural)</div>
              <p>
                Urban residents had a high <span className="text-white font-semibold">mild prevalence (78)</span> with low moderate (14) and severe (2) values. Rural residents shifted toward more serious presentations: <span className="text-white font-semibold">mild 63, moderate 25, severe 8</span> — a fourfold higher severe value than urban. The aggregate (mild 70.5, moderate 19.5, severe 5.0) masks this gap, suggesting rural populations face greater barriers to care and more severe untreated outcomes.
              </p>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold mb-2">Gender</div>
              <p>
                Females skewed toward the extremes — higher <span className="text-white font-semibold">mild (69)</span> and higher <span className="text-white font-semibold">severe (8)</span> — while males concentrated in the middle band with <span className="text-white font-semibold">moderate 31</span> (vs. 18 for females) and severe just 4. Overall: mild 64.5, moderate 24.5, severe 6.0. The female-male severe gap (8 vs. 4) is consistent with the broader literature on gender disparities in depression.
              </p>
            </div>
            <div>
              <div className="text-teal-400 font-semibold mb-2">Profession</div>
              <p>
                <span className="text-white font-semibold">Physicians had the highest severe value at 16</span> — more than double the population baseline of 7 — alongside moderate 25 and a mild value of only 58, the lowest of any group. Physician assistants (PAs) and "Other" professionals tracked closer to the baseline (severe 3 and 2 respectively). The physician spike reflects the occupational stress, moral injury, and burnout of frontline medical workers during the pandemic.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Vietnam breakdown table */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-10 overflow-x-auto">
          <h4 className="text-sm font-bold text-white mb-4">Vietnam Depression Prevalence — Full Breakdown</h4>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 px-3 text-white/60 text-xs uppercase tracking-wider">Category</th>
                <th className="text-left py-2 px-3 text-white font-semibold">Group</th>
                <th className="text-right py-2 px-3 text-white/80 font-semibold">Mild</th>
                <th className="text-right py-2 px-3 text-white/80 font-semibold">Moderate</th>
                <th className="text-right py-2 px-3 text-white/80 font-semibold">Severe</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: "Location", group: "Urban", mild: 78, moderate: 14, severe: 2, accent: "blue" },
                { cat: "Location", group: "Rural", mild: 63, moderate: 25, severe: 8, accent: "blue" },
                { cat: "Location", group: "All", mild: 70.5, moderate: 19.5, severe: 5.0, accent: "blue", isTotal: true },
                { cat: "Gender", group: "Female", mild: 69, moderate: 18, severe: 8, accent: "cyan" },
                { cat: "Gender", group: "Male", mild: 60, moderate: 31, severe: 4, accent: "cyan" },
                { cat: "Gender", group: "All", mild: 64.5, moderate: 24.5, severe: 6.0, accent: "cyan", isTotal: true },
                { cat: "Profession", group: "Physicians", mild: 58, moderate: 25, severe: 16, accent: "teal" },
                { cat: "Profession", group: "PAs", mild: 71, moderate: 20, severe: 3, accent: "teal" },
                { cat: "Profession", group: "Other", mild: 63, moderate: 24, severe: 2, accent: "teal" },
                { cat: "Profession", group: "All", mild: 64, moderate: 23, severe: 7, accent: "teal", isTotal: true },
              ].map((row, idx, arr) => {
                const showCat = idx === 0 || arr[idx - 1].cat !== row.cat;
                const accentClass = row.accent === "blue" ? "text-blue-400" : row.accent === "cyan" ? "text-cyan-400" : "text-teal-400";
                return (
                  <tr key={`${row.cat}-${row.group}`} className={`border-b border-white/10 ${row.isTotal ? "bg-white/5" : ""}`}>
                    <td className={`py-2 px-3 text-xs font-semibold uppercase tracking-wider ${accentClass}`}>
                      {showCat ? row.cat : ""}
                    </td>
                    <td className={`py-2 px-3 ${row.isTotal ? "text-white/60 italic" : "text-white/80 font-medium"}`}>
                      {row.group}
                    </td>
                    <td className="text-right py-2 px-3 text-white/70">{row.mild.toFixed(row.isTotal ? 1 : 0)}</td>
                    <td className="text-right py-2 px-3 text-white/70">{row.moderate.toFixed(row.isTotal ? 1 : 0)}</td>
                    <td className="text-right py-2 px-3 text-white/70">{row.severe.toFixed(row.isTotal ? 1 : 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-white/40 italic">
            Source: Nguyen et al. (2020), Vietnam community sample. "All" rows are the aggregate across each category.
          </p>
        </div>

        {/* Scatterplot */}
        <h3 className="text-xl font-bold text-white mb-4">Sample Size vs. Mean Age</h3>
        <FigureCard
          src="/Rplot06.png"
          caption="Scatterplot of sample size vs. mean age across all 12 studies, with linear regression trend line."
          num={10}
        />
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/70 leading-relaxed">
            The scatterplot reveals significant heterogeneity in study design. Three studies have a mean age of 0, indicating that age was not reported — a notable gap in methodological transparency. The weak positive regression trend suggests that larger studies tended to enroll slightly older participants, but the high dispersion around the trend line confirms that sample size and age were not systematically related. This variability reinforces the need for standardized reporting protocols in future research.
          </p>
        </div>
      </Section>

      {/* ── Limitations ── */}
      <Section id="limitations" className="bg-white/[0.02] border-t border-white/10">
        <SectionHeading
          tag="Limitations"
          title="Study Limitations & Causation Challenges"
        />
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Epidemiologic Limitations</h3>
            <div className="space-y-4">
              {[
                { title: "Convenience Sampling Bias", desc: "7 of 12 studies (58%) used convenience sampling, which systematically overrepresents accessible populations and may inflate or deflate prevalence estimates." },
                { title: "Cross-Sectional Design", desc: "All studies captured a single point in time, making it impossible to establish temporal relationships or track how depression evolved over the course of the pandemic." },
                { title: "Instrument Heterogeneity", desc: "Six different assessment tools produced prevalence estimates ranging from 7.4% to 48.3%, making direct comparison unreliable without standardization." },
                { title: "Demographic Imbalances", desc: "Female participants were overrepresented in most studies (46.8%–71.66%), limiting the generalizability of findings to male populations." },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-4"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-white text-sm">{item.title}</div>
                    <p className="text-sm text-white/60 mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Why Causation Is Difficult to Establish</h3>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 leading-relaxed space-y-4">
              <p>
                Even though depression prevalence increased during the COVID-19 pandemic, this correlation does not prove that the pandemic directly caused the increase. As Finsterer (2025) argued, post-COVID depression is <span className="text-white font-semibold">multicausal</span> — it cannot be attributed solely to SARS-CoV-2 infection.
              </p>
              <p>
                Multiple confounding factors occurred simultaneously: job loss, financial hardship, grief, social isolation, disrupted routines, and fear of infection. Because these stressors were inseparable from the pandemic itself, it is methodologically impossible to isolate the independent effect of COVID-19 on depression using observational data alone.
              </p>
              <p>
                Establishing causation would require a <span className="text-white font-semibold">longitudinal experimental or quasi-experimental design</span> with pre-pandemic baseline data, consistent assessment tools, and matched control populations — conditions that were not met by any of the 12 studies in this dataset.
              </p>
            </div>

            {/* Study design definitions */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">Longitudinal Experimental Design</h4>
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded uppercase tracking-wider">LED</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-3">
                  A study that follows the <span className="text-white/90 font-semibold">same participants over time</span> with researchers actively manipulating an independent variable and randomly assigning subjects to treatment or control groups. The repeated measurements before, during, and after the intervention let researchers establish temporal order and isolate causal effects.
                </p>
                <p className="text-[11px] text-white/50 italic border-l-2 border-white/20 pl-3">
                  <span className="text-white/60 font-semibold">Example:</span> randomly assigning a cohort to receive teletherapy vs. usual care during a pandemic, measuring depression scores quarterly for two years.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">Quasi-Experimental Design</h4>
                  <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded uppercase tracking-wider">QED</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-3">
                  A study that tests cause-and-effect <span className="text-white/90 font-semibold">without random assignment</span>. Researchers use naturally occurring groups (e.g., regions with vs. without lockdowns) and statistical controls — matched comparisons, difference-in-differences, interrupted time series — to approximate an experiment when randomization is impossible or unethical.
                </p>
                <p className="text-[11px] text-white/50 italic border-l-2 border-white/20 pl-3">
                  <span className="text-white/60 font-semibold">Example:</span> comparing depression trends in countries that imposed early lockdowns to demographically matched countries that did not, using pre-2020 baseline rates as the control.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sampling Methods Glossary */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-white mb-6">Sampling Methods Reference</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Convenience Sampling",
                abbr: "CS",
                desc: "Researchers select participants based on accessibility and willingness to participate, without random selection. This is the easiest but most biased approach, as it systematically overrepresents individuals who are easy to reach.",
                example: "Recruiting students from a single university or clinic patients who visit on a particular day.",
              },
              {
                name: "Random Sampling",
                abbr: "RS",
                desc: "Participants are selected randomly from a defined population, giving every member an equal chance of being included. This approach minimizes selection bias and improves representativeness.",
                example: "Using a random number generator to select 500 names from a census list of 50,000 residents.",
              },
              {
                name: "Quota Sampling",
                abbr: "QS",
                desc: "Researchers divide the population into subgroups (quotas) based on demographic characteristics, then recruit a predetermined number from each subgroup. This ensures representation across key variables but may still introduce bias within quotas.",
                example: "Ensuring 50% males and 50% females, with age ranges represented proportionally to the general population.",
              },
              {
                name: "Snowball Sampling",
                abbr: "SS",
                desc: "Existing participants recruit future participants from among their acquaintances, creating a chain-referral effect. This method is useful for hard-to-reach populations but introduces social bias.",
                example: "Asking COVID-19 survivors to refer other survivors for a qualitative interview study.",
              },
            ].map((method) => (
              <motion.div
                key={method.abbr}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="rounded-lg border border-white/10 bg-white/5 p-5 hover:border-blue-400/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white">{method.name}</h4>
                  <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{method.abbr}</span>
                </div>
                <p className="text-sm text-white/70 mb-3 leading-relaxed">{method.desc}</p>
                <p className="text-xs text-white/50 italic border-l-2 border-white/20 pl-3">
                  <span className="text-white/60 font-semibold">Example:</span> {method.example}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70 leading-relaxed">
              In this dataset, 7 of 12 studies (58%) employed <span className="text-cyan-400 font-semibold">convenience sampling</span>, which means participants were recruited based on accessibility rather than random selection. This methodological choice may have systematically skewed the depression prevalence estimates if the accessible populations differed systematically from the target population in mental health status.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Conclusion ── */}
      <Section id="conclusion" className="border-t border-white/10">
        <SectionHeading
          tag="Conclusion"
          title="Recommendations & Policy Implications"
          subtitle="Evidence-based recommendations for policy, insurance, and future research funding."
        />

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: "🏛️",
              title: "Policy Reform",
              color: "blue",
              points: [
                "Integrate mental health screening into all emergency response plans",
                "Mandate standardized assessment tools across public health studies",
              ],
            },
            {
              icon: "🏥",
              title: "Insurance Benefits",
              color: "cyan",
              points: [
                "Fully cover therapy, counseling, and psychiatric medications",
                "Eliminate cost barriers that prevent care-seeking during crises",
                "Permanently extend telehealth coverage beyond the pandemic",
              ],
            },
            {
              icon: "🔬",
              title: "Research Funding",
              color: "teal",
              points: [
                "Fund longitudinal studies with pre-pandemic baseline data",
                "Standardize assessment tools across future pandemic research",
                "Prioritize high-risk groups: physicians, rural populations, females",
              ],
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className={`text-lg font-bold mb-4 ${card.color === "blue" ? "text-blue-400" : card.color === "cyan" ? "text-cyan-400" : "text-teal-400"}`}>
                {card.title}
              </h3>
              <ul className="space-y-2">
                {card.points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-white/60">
                    <span className="text-white/30 mt-0.5">→</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Closing quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-xl border border-blue-400/20 bg-blue-600/10 p-8 text-center"
        >
          <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
            "You cannot have overall good health without good mental health. The COVID-19 pandemic was a catalyst that exposed the inadequacy of existing mental health support systems — and the data demands a response."
          </p>
          <div className="mt-4 text-sm text-white/50">Brian L. Moore · INFM 316 · Mercer University · 2026</div>
        </motion.blockquote>
      </Section>

      {/* ── References ── */}
      <Section id="references" className="bg-white/[0.02] border-t border-white/10">
        <SectionHeading tag="References" title="Works Cited" />
        <div className="space-y-5 text-sm text-white/70 leading-relaxed">
          {[
            "Bueno-Notivol, J., Gracia-García, P., Olaya, B., Lasheras, I., López-Antón, R., & Santabárbara, J. (2021). Prevalence of depression during the COVID-19 outbreak: A meta-analysis of community-based studies. International Journal of Clinical and Health Psychology, 21(1), Article 100196. https://doi.org/10.1016/j.ijchp.2020.07.007",
            "Finsterer, J. (2025). Post-COVID depression and anxiety are multicausal and not necessarily due to SARS-CoV-2 infection. European Archives of Psychiatry and Clinical Neuroscience, 275(4), 1263–1264. https://doi.org/10.1007/s00406-024-01800-4",
            "Nalbandian, A., Sehgal, K., Gupta, A., Madhavan, M. V., McGroder, C., Stevens, J. S., Cook, J. R., Nordvig, A. S., Shalev, D., Sehrawat, T. S., Ahluwalia, N., Bikdeli, B., Dietz, D., Der-Nigoghossian, C., Liyanage-Don, N., Rosner, G. F., Bernstein, E. J., Mohan, S., Beckley, A. A., … Wan, E. Y. (2021). Post-acute COVID-19 syndrome. Nature Medicine, 27, 601–615. https://doi.org/10.1038/s41591-021-01283-z",
            "Ritchie, K., Chan, D., & Watermeyer, T. (2020). The cognitive consequences of the COVID-19 epidemic: Collateral damage? Brain Communications, 2(2), Article fcaa069. https://doi.org/10.1093/braincomms/fcaa069",
            "Waszkiewicz, N. (2021). Biomarkers of post-COVID depression. Journal of Clinical Medicine, 10(18), 4142. https://doi.org/10.3390/jcm10184142",
          ].map((ref, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="pl-8 -indent-8 border-l-2 border-white/10 py-2"
            >
              {ref}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-8">
        <div className="container max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <span>The Prevalence of Depression During the COVID-19 Outbreak</span>
          <span>Brian L. Moore · Mercer University · INFM 316 · 2026</span>
        </div>
      </footer>
    </div>
  );
}

