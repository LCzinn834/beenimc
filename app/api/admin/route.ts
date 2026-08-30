import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { addCategory, deleteCategory, deleteTexture, getData, saveTexture, type Texture } from "@/lib/store";

function text(form: FormData, name: string) { return String(form.get(name) || "").trim(); }
async function saveFile(form: FormData, key: "image" | "download") {
  const file = form.get(key);
  if (!(file instanceof File) || !file.size) return text(form, `${key}Url`);
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN não configurado");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`${key}s/${randomUUID()}-${safeName}`, file, { access: "public", addRandomSuffix: true, contentType: file.type || undefined });
  return blob.url;
}

export async function POST(request: Request) {
  const form = await request.formData();
  if (text(form, "code") !== process.env.ADMIN_CODE) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const action = text(form, "action");
    if (action === "category") {
      const name = text(form, "name");
      if (!name) return Response.json({ error: "Informe o nome da aba." }, { status: 400 });
      await addCategory({ id: randomUUID(), name });
    }
    if (action === "delete-category") await deleteCategory(text(form, "id"));
    if (action === "delete-texture") await deleteTexture(text(form, "id"));
    if (action === "texture") {
      const id = text(form, "id") || randomUUID();
      const current = (await getData()).textures.find(texture => texture.id === id);
      const [imageUrl, downloadUrl] = await Promise.all([saveFile(form, "image"), saveFile(form, "download")]);
      const texture: Texture = { id, title: text(form, "title"), description: text(form, "description"), version: text(form, "version"), categoryId: text(form, "categoryId"), imageUrl: imageUrl || current?.imageUrl || "", downloadUrl: downloadUrl || current?.downloadUrl || "", createdAt: current?.createdAt || new Date().toISOString() };
      if (!texture.title || !texture.description || !texture.version || !texture.categoryId) return Response.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
      await saveTexture(texture);
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao salvar." }, { status: 500 });
  }
}
