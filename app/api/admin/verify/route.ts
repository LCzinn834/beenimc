export async function POST(request:Request){const {code}=await request.json(); return Response.json({ok:Boolean(process.env.ADMIN_CODE&&code===process.env.ADMIN_CODE)})}
