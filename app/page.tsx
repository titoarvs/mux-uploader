import { UploadForm } from "@/components/upload-form";
import { VideoList } from "@/components/video-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Mux Video Uploader
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Upload, manage, and stream your videos with Mux's powerful video
          platform
        </p>

        <Tabs defaultValue="upload" className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="videos">My Videos</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-6">
            <UploadForm />
          </TabsContent>
          <TabsContent value="videos" className="mt-6">
            <VideoList />
          </TabsContent>
        </Tabs>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
      </div>
    </main>
  );
}
