import { NextResponse } from "next/server";
import crypto from "crypto";

// Example DB update (you'll replace this with your actual DB logic)
async function updateVideoStatus(
  assetId: string,
  status: string
): Promise<void> {
  console.log(`Updating asset ${assetId} with status: ${status}`);
  // e.g., await db.videos.update({ muxAssetId: assetId }, { status });
}

function verifyMuxSignature(bodyBuffer: string, headers: Headers): boolean {
  const muxSignatureHeader = headers.get("mux-signature");
  if (!muxSignatureHeader) return false;

  const [tsPart, sigPart] = muxSignatureHeader.split(",");
  const timestamp = tsPart.split("=")[1];
  const signature = sigPart.split("=")[1];

  if (!process.env.MUX_SIGNING_SECRET) {
    console.error("MUX_SIGNING_SECRET is not defined");
    return false;
  }

  const payload = `${timestamp}.${bodyBuffer}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.MUX_SIGNING_SECRET)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}

export async function POST(req: Request): Promise<Response> {
  const bodyBuffer = await req.arrayBuffer();
  const rawBody = Buffer.from(bodyBuffer).toString();

  const isValid = verifyMuxSignature(rawBody, req.headers);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = event;
  const assetId = data.id;

  let status;
  switch (type) {
    case "video.asset.created":
      status = "processing";
      break;
    case "video.asset.ready":
      status = "ready";
      break;
    case "video.asset.errored":
      status = "error";
      break;
    default:
      status = "unknown";
  }

  if (assetId && status !== "unknown") {
    await updateVideoStatus(assetId, status);
  }

  return NextResponse.json({ message: "Webhook received" });
}
