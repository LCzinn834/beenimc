import { getData } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return Response.json(await getData(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    console.error(error);
    const message = error instanceof Error && error.message.startsWith("Configure DATABASE_URL")
      ? error.message
      : "Não foi possível carregar os dados.";
    return Response.json({ error: message }, { status: 500 });
  }
}
