import { neon } from "@neondatabase/serverless";
import { JSONFilePreset } from "lowdb/node";
import path from "path";

export type Category = { id: string; name: string };
export type Texture = { id: string; title: string; description: string; imageUrl: string; version: string; downloadUrl: string; categoryId: string; createdAt: string };
export type Data = { categories: Category[]; textures: Texture[] };

const initial: Data = { categories: [{ id: "seeds", name: "Seeds" }], textures: [] };
const file = path.join(process.cwd(), "data.json");
const hasDatabase = Boolean(process.env.DATABASE_URL);
let schema: Promise<void> | undefined;

async function localDb() { return JSONFilePreset<Data>(file, initial); }
async function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada");
  return neon(process.env.DATABASE_URL);
}
async function ensureSchema() {
  if (!hasDatabase) return;
  schema ??= (async () => {
    const db = await sql();
    await db`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL)`;
    await db`CREATE TABLE IF NOT EXISTS textures (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT '', version TEXT NOT NULL, download_url TEXT NOT NULL DEFAULT '',
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await db`INSERT INTO categories (id, name) VALUES ('seeds', 'Seeds') ON CONFLICT (id) DO NOTHING`;
  })();
  return schema;
}

export async function getData(): Promise<Data> {
  if (!hasDatabase) return (await localDb()).data;
  await ensureSchema();
  const db = await sql();
  const [categories, textures] = await Promise.all([
    db`SELECT id, name FROM categories ORDER BY name`,
    db`SELECT id, title, description, image_url, version, download_url, category_id, created_at FROM textures ORDER BY created_at DESC`,
  ]);
  return { categories: categories as Category[], textures: textures.map((texture: Record<string, unknown>) => ({
    id: String(texture.id), title: String(texture.title), description: String(texture.description),
    imageUrl: String(texture.image_url ?? ""), version: String(texture.version),
    downloadUrl: String(texture.download_url ?? ""), categoryId: String(texture.category_id),
    createdAt: new Date(String(texture.created_at)).toISOString(),
  })) };
}
export async function addCategory(category: Category) {
  if (!hasDatabase) { const db = await localDb(); db.data.categories.push(category); return db.write(); }
  await ensureSchema(); const db = await sql(); await db`INSERT INTO categories (id, name) VALUES (${category.id}, ${category.name})`;
}
export async function deleteCategory(id: string) {
  if (!hasDatabase) { const db = await localDb(); db.data.categories = db.data.categories.filter(x => x.id !== id); db.data.textures = db.data.textures.filter(x => x.categoryId !== id); return db.write(); }
  await ensureSchema(); const db = await sql(); await db`DELETE FROM categories WHERE id = ${id}`;
}
export async function saveTexture(texture: Texture) {
  if (!hasDatabase) { const db = await localDb(); const index = db.data.textures.findIndex(x => x.id === texture.id); if (index === -1) db.data.textures.unshift(texture); else db.data.textures[index] = texture; return db.write(); }
  await ensureSchema(); const db = await sql();
  await db`INSERT INTO textures (id, title, description, image_url, version, download_url, category_id, created_at)
    VALUES (${texture.id}, ${texture.title}, ${texture.description}, ${texture.imageUrl}, ${texture.version}, ${texture.downloadUrl}, ${texture.categoryId}, ${texture.createdAt})
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
      image_url = EXCLUDED.image_url, version = EXCLUDED.version, download_url = EXCLUDED.download_url, category_id = EXCLUDED.category_id`;
}
export async function deleteTexture(id: string) {
  if (!hasDatabase) { const db = await localDb(); db.data.textures = db.data.textures.filter(x => x.id !== id); return db.write(); }
  await ensureSchema(); const db = await sql(); await db`DELETE FROM textures WHERE id = ${id}`;
}
