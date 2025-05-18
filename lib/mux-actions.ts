"use server";

import Mux from "@mux/mux-node";
import type { MuxAsset } from "./types";

const client = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function createUploadUrl(title: string, description: string) {
  try {
    const upload = await client.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: "basic",
        passthrough: JSON.stringify({
          title,
          description,
        }),
        meta: {
          title,
          creator_id: description,
          external_id: "external_id",
        },
      },
    });
    console.log("🚀 ~ createUploadUrl ~ upload:", upload);

    return {
      id: upload.id,
      url: upload.url,
    };
  } catch (error) {
    console.error("Error creating upload URL:", error);
    throw new Error(
      `Failed to create upload URL: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getAssets(): Promise<MuxAsset[]> {
  try {
    const { data } = await client.video.assets.list({
      limit: 10,
    });
    console.log("🚀 ~ getAssets ~ data:", data);

    return data.map((asset: any) => {
      let title = "";
      let description = "";

      if (asset.passthrough) {
        try {
          const passthroughData = JSON.parse(asset.passthrough);
          title = passthroughData.title || "";
          description = passthroughData.description || "";
        } catch (e) {
          // Ignore parsing errors
        }
      }

      return {
        id: asset.id,
        status: asset.status,
        playback_ids: asset.playback_ids,
        created_at: asset.created_at,
        duration: asset.duration,
        title,
        description,
      };
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw new Error(
      `Failed to fetch assets: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deleteAsset(assetId: string) {
  try {
    await client.video.assets.delete(assetId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw new Error(
      `Failed to delete asset: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
