
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Image as ImageIcon, RefreshCcw, Trash2 } from "lucide-react";

interface SlideDef { id: number; title: string; text: string; bg: string | null; align: "bottom-left" | "center" | "top-left"; }
interface BrandCfg { brand: string; primary: string; accent: string; textOnImage: string; }

export function chunkStory(story: string, maxChars: number): string[] {
  const sentences = story.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const chunks: string[] = []; let current = "";
  for (const s of sentences) {
    if ((current + " " + s).trim().length <= maxChars) { current = (current + " " + s).trim(); }
    else { if (current) chunks.push(current); current = s; }
  } if (current) chunks.push(current); return chunks;
}

export function structureStory(story: string, maxChars: number): { title: string; text: string }[] {
  const parts = chunkStory(story, Math.max(80, Math.round(maxChars * 0.8)));
  const slides: { title: string; text: string }[] = [];
  if (parts.length) slides.push({ title: "Hook", text: parts[0] });
  if (parts.length > 1) slides.push({ title: "Problem", text: parts[1] });
  if (parts.length > 2) slides.push({ title: "Insight", text: parts[2] });
  for (let i = 3; i < parts.length - 1; i++) slides.push({ title: `Step ${i - 2}`, text: parts[i] });
  if (parts.length > 3) slides.push({ title: "CTA", text: parts[parts.length - 1] });
  return slides.length ? slides : parts.map((p, i) => ({ title: `Slide ${i + 1}`, text: p }));
}

const defaultBrand: BrandCfg = { brand: "TACTUS", primary: "#111827", accent: "#0ea5e9", textOnImage: "#ffffff" };

export default function Page() {
  const [story, setStory] = useState("We turned €10 ad spend into €300 revenue. Here's the simple framework you can copy today. Start by defining a crystal-clear offer. Then test three creative angles per week (problem, outcome, social proof). Sync your landing page with the ad promise. Finally, iterate weekly: kill losers, scale winners. Save this post.");
  const [maxChars, setMaxChars] = useState<number>(220);
  const [useAutoStructure, setUseAutoStructure] = useState<boolean>(true);
  const [slides, setSlides] = useState<SlideDef[]>([]);
  const [ratio, setRatio] = useState<"4:5" | "1:1">("4:5");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(70);
  const [brand, setBrand] = useState<BrandCfg>(defaultBrand);
  const [fontScale, setFontScale] = useState<number>(100);
  const [testResults, setTestResults] = useState<string[]>([]);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { handleGenerate(); runUnitTests(); }, []);

  function handleGenerate() {
    const raw = useAutoStructure ? structureStory(story, maxChars) : chunkStory(story, maxChars).map((t, i) => ({ title: `Slide ${i + 1}`, text: t }));
    setSlides(raw.map((s, i) => ({ id: i + 1, title: s.title, text: s.text, bg: null, align: "bottom-left" })));
  }
  function addSlide() { setSlides((prev) => [...prev, { id: prev.length + 1, title: `Slide ${prev.length + 1}`, text: "", bg: null, align: "bottom-left" }]); }
  function removeSlide(id: number) { setSlides((prev) => prev.filter((s) => s.id != id).map((s, idx) => ({ ...s, id: idx + 1 }))); }
  function handleImageUpload(i: number, file: File) {
    const reader = new FileReader(); reader.onload = (e) => {
      const result = (e.target as FileReader)?.result as string;
      setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, bg: result } : s)));
    }; reader.readAsDataURL(file);
  }

  async function exportSlidePNG(i: number) {
    const { toPng } = await import("html-to-image");
    const node = slideRefs.current[i]; if (!node) return;
    const dataUrl = await toPng(node, { pixelRatio: 2 });
    const a = document.createElement("a"); a.href = dataUrl; a.download = `slide_${i + 1}.png`; a.click();
  }
  async function exportAllPNGs() {
    const { toPng } = await import("html-to-image");
    const JSZip = (await import("jszip")).default; const zip = new JSZip();
    for (let i = 0; i < slides.length; i++) {
      const node = slideRefs.current[i]; if (!node) continue;
      const dataUrl = await toPng(node, { pixelRatio: 2 });
      const base64 = dataUrl.split(",")[1];
      zip.file(`slide_${String(i + 1).padStart(2, "0")}.png`, base64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "carousel_slides.zip"; a.click();
  }
  async function exportPDF() {
    const { toPng } = await import("html-to-image");
    const { jsPDF } = await import("jspdf"); const doc = new jsPDF({ orientation: "portrait", unit: "px", format: ratio === "4:5" ? [864, 1080] : [1080, 1080] });
    for (let i = 0; i < slides.length; i++) {
      const node = slideRefs.current[i]; if (!node) continue;
      const dataUrl = await toPng(node, { pixelRatio: 2 });
      const imgProps = (doc as any).getImageProperties(dataUrl);
      const pageW = doc.internal.pageSize.getWidth(); const pageH = doc.internal.pageSize.getHeight();
      let w = pageW; let h = (imgProps.height * w) / imgProps.width;
      if (h > pageH) { h = pageH; w = (imgProps.width * h) / imgProps.height; }
      const x = (pageW - w) / 2; const y = (pageH - h) / 2;
      doc.addImage(dataUrl, "PNG", x, y, w, h); if (i < slides.length - 1) doc.addPage();
    } doc.save("carousel_linkedin.pdf");
  }

  function runUnitTests() {
    const results: string[] = [];
    try { const s1 = "One. Two three four five. Six? Seven!"; const chunks1 = chunkStory(s1, 12); const okLen = chunks1.every((c) => c.length <= 12); results.push(okLen ? "PASS chunkStory: respects max length" : "FAIL chunkStory: found chunk > maxChars"); } catch (e) { results.push("FAIL chunkStory threw " + (e as Error).message); }
    try { const s2 = "Hook sentence. Problem sentence. Insight sentence. A step. CTA sentence."; const slides2 = structureStory(s2, 80); const hasHPIC = slides2[0]?.title === "Hook" && slides2[1]?.title === "Problem" && slides2[2]?.title === "Insight" && slides2[slides2.length - 1]?.title === "CTA"; results.push(hasHPIC ? "PASS structureStory: HPIC+CTA" : "FAIL structureStory: missing expected sections"); } catch (e) { results.push("FAIL structureStory threw " + (e as Error).message); }
    try { const s3 = "Line1\nLine2\nLine3"; const chunks3 = chunkStory(s3, 50); results.push(chunks3.length >= 1 ? "PASS chunkStory: strips newlines" : "FAIL chunkStory: newline handling"); } catch (e) { results.push("FAIL newline test threw " + (e as Error).message); }
    try { const s4 = "Just one sentence."; const slides4 = structureStory(s4, 200); results.push(slides4.length >= 1 ? "PASS structureStory: short story produces at least one slide" : "FAIL structureStory: short story produced no slides"); } catch (e) { results.push("FAIL short story test threw " + (e as Error).message); }
    setTestResults(results); results.forEach((r) => console.log("[tests]", r));
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Instagram Slide Carousel Creator</h1>
            <p className="text-sm text-neutral-600">Paste a story → auto-split into slides → tweak → export PNG/PDF.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleGenerate}><RefreshCcw className="mr-2 h-4 w-4"/>Regenerate</Button>
            <Button onClick={addSlide}><Plus className="mr-2 h-4 w-4"/>Add slide</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Story → Slides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your story</label>
                <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={10} placeholder="Paste your story..."/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max chars/slide</label>
                  <Input type="number" value={maxChars} onChange={(e) => setMaxChars(Number(e.target.value || 220))}/>
                </div>
                <div className="flex items-center justify-between pt-6">
                  <span className="text-sm">Auto-structure</span>
                  <Switch checked={useAutoStructure} onCheckedChange={(checked) => setUseAutoStructure(!!checked)}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Aspect ratio</label>
                  <Tabs value={ratio} onValueChange={(v) => setRatio(v as "4:5" | "1:1")} className="mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="4:5">IG 4:5</TabsTrigger>
                      <TabsTrigger value="1:1">Square</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div>
                  <label className="text-sm font-medium">Overlay opacity ({overlayOpacity}%)</label>
                  <Slider value={[overlayOpacity]} onValueChange={(v) => setOverlayOpacity(v[0])} max={90} step={1}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand tag</label>
                  <Input value={brand.brand} onChange={(e) => setBrand({ ...brand, brand: e.target.value })}/>
                </div>
                <div>
                  <label className="text-sm font-medium">Font scale ({fontScale}%)</label>
                  <Slider value={[fontScale]} onValueChange={(v) => setFontScale(v[0])} min={60} max={140} step={1}/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-600">Primary</label>
                  <Input type="color" value={brand.primary} onChange={(e) => setBrand({ ...brand, primary: e.target.value })}/>
                </div>
                <div>
                  <label className="text-xs text-neutral-600">Accent</label>
                  <Input type="color" value={brand.accent} onChange={(e) => setBrand({ ...brand, accent: e.target.value })}/>
                </div>
                <div>
                  <label className="text-xs text-neutral-600">Text on image</label>
                  <Input type="color" value={brand.textOnImage} onChange={(e) => setBrand({ ...brand, textOnImage: e.target.value })}/>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="secondary" onClick={exportAllPNGs}><ImageIcon className="mr-2 h-4 w-4"/>Export PNG (ZIP)</Button>
                <Button variant="secondary" onClick={exportPDF}><FileText className="mr-2 h-4 w-4"/>Export PDF</Button>
                <Button variant="outline" onClick={runUnitTests}>Run tests</Button>
              </div>

              {testResults.length > 0 && (
                <div className="rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-700">
                  <div className="font-semibold mb-1">Unit tests</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {testResults.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {slides.map((slide, i) => (
              <Card key={slide.id}>
                <CardHeader className="flex items-center justify-between flex-row">
                  <CardTitle className="text-base">Slide {slide.id}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => exportSlidePNG(i)}>
                      <ImageIcon className="mr-2 h-4 w-4"/>PNG
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeSlide(slide.id)}>
                      <Trash2 className="mr-2 h-4 w-4"/>Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium">Title</label>
                      <Input
                        value={slide.title}
                        onChange={(e) =>
                          setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, title: e.target.value } : s)))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Text</label>
                      <Textarea
                        rows={6}
                        value={slide.text}
                        onChange={(e) =>
                          setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, text: e.target.value } : s)))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Background image</label>
                      <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] and handleImageUpload(i, e.target.files[0])} />
                      <p className="text-xs text-neutral-500 mt-1">Optional. Otherwise a neutral gradient is used.</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div
                      ref={(el) => (slideRefs.current[i] = el)}
                      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
                      style={{ aspectRatio: ratio === "4:5" ? "4 / 5" : "1 / 1", backgroundColor: brand.primary }}
                    >
                      {slide.bg ? (
                        <img src={slide.bg} alt="bg" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
                      )}

                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(180deg, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${Math.max(0,(overlayOpacity - 25) / 100)}) 60%, rgba(0,0,0,0.0) 100%)`,
                        }}
                      />

                      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 py-3">
                        <div className="text-xs font-semibold tracking-wide text-white/90 bg-black/30 rounded-md px-2 py-1">
                          {`${i + 1}/${slides.length}`}
                        </div>
                        <div className="text-xs font-black uppercase tracking-widest text-white/90 bg-black/30 rounded-md px-2 py-1">
                          {brand.brand}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex">
                        <div className="mt-auto p-6 md:p-10 w-full">
                          <h2
                            className="font-extrabold leading-tight"
                            style={{ color: brand.textOnImage, fontSize: `${Math.round(40 * (fontScale / 100))}px` }}
                          >
                            {slide.title}
                          </h2>
                          <p className="mt-3 whitespace-pre-line text-white/90" style={{ fontSize: `${Math.round(26 * (fontScale / 100))}px` }}>
                            {slide.text}
                          </p>
                          <div className="mt-6 flex items-center justify-end">
                            <span className="text-white/70 text-xs">Save • Share • Follow</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">Preview uses {ratio === "4:5" ? "1080×1350 (IG portrait)" : "1080×1080 (square)"} proportions.</div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {slides.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-neutral-500">
                  Paste a story and click <strong>Regenerate</strong> to create slides.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <footer className="pt-4 text-center text-xs text-neutral-500">
          Built with ❤️ — export PNGs for Instagram and a multi-page PDF for LinkedIn.
        </footer>
      </div>
    </div>
  );
}
