import { db } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function GET(){const d=await db();return Response.json(d.data,{headers:{"Cache-Control":"no-store"}})}
