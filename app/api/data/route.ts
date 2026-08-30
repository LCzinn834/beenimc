import { getData } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return Response.json(await getData(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { console.error(error); return Response.json({ error: "Não foi possível carregar os dados." }, { status: 500 }); }
}
