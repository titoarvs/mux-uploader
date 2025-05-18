"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createUploadUrl } from "@/lib/mux-actions";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Step 1: Get a direct upload URL from Mux
      const uploadData = await createUploadUrl(title, description);
      console.log("🚀 ~ handleSubmit ~ uploadData:", uploadData);

      if (!uploadData || !uploadData.url) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload the file to Mux
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadData.url, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setProgress(percentComplete);
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      toast({
        title: "Upload successful",
        description: "Your video has been uploaded and is being processed",
      });

      // Reset form and refresh the videos list
      setFile(null);
      setTitle("");
      setDescription("");
      setProgress(0);
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Upload a New Video</CardTitle>
          <CardDescription>
            Upload your video to Mux for high-quality streaming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter video description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            {!file ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="video"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-muted/50 hover:bg-muted"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, MOV, or WebM (max 2GB)
                    </p>
                  </div>
                  <Input
                    id="video"
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-md">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>

                {progress > 0 && uploading && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-right text-muted-foreground">
                      {progress}% uploaded
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={uploading || !file}>
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
