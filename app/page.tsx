"use client";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { NotchNav } from "@/components/ui/adaptive-notch-navigation-bar";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import type { Data } from "@/lib/store";

export default function Home() {
  const [data, setData] = useState<Data>({ categories: [], textures: [] });
  const [category, setCategory] = useState("all"); const [query, setQuery] = useState(""); const [version, setVersion] = useState("all"); const [nav, setNav] = useState("inicio");
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/data", { cache: "no-store" });
        if (!response.ok) return;
        const nextData: Data = await response.json();
        if (active) setData(nextData);
      } catch {
        // Mantém os últimos dados visíveis caso a conexão falhe temporariamente.
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    const refreshAfterAdminUpdate = (event: StorageEvent) => {
      if (event.key === "beenimc-data-updated") load();
    };

    load();
    window.addEventListener("focus", load);
    window.addEventListener("storage", refreshAfterAdminUpdate);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const interval = window.setInterval(load, 15_000);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
      window.removeEventListener("storage", refreshAfterAdminUpdate);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(interval);
    };
  }, []);
  useEffect(() => { document.getElementById(nav)?.scrollIntoView({ behavior: "smooth" }); }, [nav]);
  const versions = Array.from(new Set(data.textures.map(texture => texture.version)));
  const textures = useMemo(() => data.textures.filter(texture => (category === "all" || texture.categoryId === category) && (version === "all" || texture.version === version) && (`${texture.title} ${texture.description}`).toLowerCase().includes(query.toLowerCase())), [data, category, version, query]);
  return <NotchNav items={[{ id: "inicio", label: "Início" }, { id: "texturas", label: "Texturas" }, { id: "sobre", label: "Sobre" }]} activeId={nav} onActiveChange={setNav}><main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-20 sm:px-6"><BackgroundPaths /><section id="texturas" className="scroll-mt-20 py-16"><div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-600">coleção atual</p><h2 className="mt-2 text-3xl font-black">Texturas para explorar</h2></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-3 text-sky-600" size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar textura" className="h-11 rounded-xl border border-sky-200 bg-white pl-10 pr-3 outline-none focus:ring-2 focus:ring-sky-400" /></label><label className="relative"><SlidersHorizontal className="absolute left-3 top-3 text-sky-600" size={18} /><select value={version} onChange={event => setVersion(event.target.value)} className="h-11 rounded-xl border border-sky-200 bg-white pl-10 pr-8 outline-none"><option value="all">Todas versões</option>{versions.map(item => <option key={item}>{item}</option>)}</select></label></div></div><div className="mb-8 flex gap-2 overflow-x-auto pb-2"><Button variant={category === "all" ? "default" : "outline"} onClick={() => setCategory("all")}>Todas</Button>{data.categories.map(item => <Button key={item.id} variant={category === item.id ? "default" : "outline"} onClick={() => setCategory(item.id)}>{item.name}</Button>)}</div>{textures.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{textures.map(texture => <article key={texture.id} className="glass overflow-hidden rounded-2xl"><div className="aspect-video bg-gradient-to-br from-sky-300 to-blue-700">{texture.imageUrl && <img src={texture.imageUrl} alt={texture.title} className="h-full w-full object-cover" />}</div><div className="p-5"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-bold">{texture.title}</h3><span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold text-sky-800">{texture.version}</span></div><p className="min-h-12 text-sm text-slate-600">{texture.description}</p><Button asChild className="mt-5 w-full gap-2"><a href={texture.downloadUrl || "#"} target="_blank"><Download size={16} />Download</a></Button></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-sky-300 bg-white/70 p-12 text-center text-slate-500">Nenhuma textura encontrada com esses filtros.</div>}</section><footer id="sobre" className="scroll-mt-20 border-t border-sky-100 py-8 text-center text-sm text-slate-500">Criado por <a className="font-bold text-sky-700" href="https://www.tiktok.com/@beenimc" target="_blank">BEENIMC</a></footer></main></NotchNav>;
}
