"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Trash2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAssets, deleteAsset } from "@/lib/mux-actions";
import type { MuxAsset } from "@/lib/types";
import { VideoPlayer } from "@/components/video-player";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogTitle } from "@radix-ui/react-dialog";

export function VideoList() {
  const [assets, setAssets] = useState<MuxAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MuxAsset | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await getAssets();
      console.log("🚀 ~ fetchAssets ~ data:", data);
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast({
        title: "Error loading videos",
        description: "Failed to load your videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      try {
        setDeleting(id);
        await deleteAsset(id);
        setAssets(assets.filter((asset) => asset.id !== id));
        toast({
          title: "Video deleted",
          description: "The video has been successfully deleted",
        });
      } catch (error) {
        console.error("Error deleting asset:", error);
        toast({
          title: "Delete failed",
          description: "Failed to delete the video. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="success">Ready</Badge>;
      case "preparing":
        return <Badge variant="warning">Processing</Badge>;
      case "errored":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  function convertUnixToFormattedDate(timestamp: string) {
    const date = new Date(Number(timestamp) * 1000);

    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${month}-${day}-${year}`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Videos</CardTitle>
          <CardDescription>Manage your uploaded videos</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAssets}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-24 w-40 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No videos uploaded yet</p>
            <Button
              variant="link"
              onClick={() =>
                document
                  .querySelector('[data-value="upload"]')
                  ?.dispatchEvent(new MouseEvent("click"))
              }
            >
              Upload your first video
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {asset.status === "ready" && asset.playback_ids?.[0] ? (
                  <div className="relative w-full md:w-40 h-24 bg-muted rounded-md overflow-hidden">
                    <img
                      src={`https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg?time=0&width=320`}
                      alt={asset.title || "Video thumbnail"}
                      className="w-full h-full object-cover"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute inset-0 m-auto bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10"
                          onClick={() => setSelectedVideo(asset)}
                        >
                          <Play className="h-5 w-5" />
                          <span className="sr-only">Play video</span>
                        </Button>
                      </DialogTrigger>
                      <DialogTitle>{asset.title}</DialogTitle>
                      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black">
                        {selectedVideo && selectedVideo.playback_ids?.[0] && (
                          <VideoPlayer
                            playbackId={selectedVideo.playback_ids[0].id}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="w-full md:w-40 h-24 bg-muted rounded-md flex items-center justify-center">
                    <RefreshCw
                      className={`h-6 w-6 text-muted-foreground ${
                        asset.status === "preparing" ? "animate-spin" : ""
                      }`}
                    />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">
                        {asset.title || "Untitled Video"}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {asset.description || "No description"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleDelete(asset.id)}
                      disabled={deleting === asset.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getStatusBadge(asset.status)}
                    </div>
                    <div>•</div>
                    <div>
                      Uploaded {convertUnixToFormattedDate(asset.created_at)}
                    </div>
                    {asset.duration && (
                      <>
                        <div>•</div>
                        <div>
                          {Math.floor(asset.duration / 60)}:
                          {Math.floor(asset.duration % 60)
                            .toString()
                            .padStart(2, "0")}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
