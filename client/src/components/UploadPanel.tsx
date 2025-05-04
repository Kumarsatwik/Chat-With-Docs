import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { File, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import axios, { AxiosProgressEvent } from "axios";

// Helper to get file icon based on type
const getFileIcon = (type: string) => {
  if (type.includes("pdf")) return "📄";
  if (type.includes("doc")) return "📝";
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv"))
    return "📊";
  if (type.includes("powerpoint") || type.includes("presentation")) return "📑";
  if (type.includes("image")) return "🖼️";
  if (type.includes("text")) return "📃";
  return "📁";
};

// File type formatting
const getFileTypeLabel = (type: string) => {
  if (type.includes("pdf")) return "PDF";
  if (type.includes("doc")) return "DOCX";
  if (type.includes("sheet") || type.includes("excel")) return "XLSX";
  if (type.includes("csv")) return "CSV";
  if (type.includes("powerpoint") || type.includes("presentation"))
    return "PPTX";
  if (type.includes("image")) return type.split("/")[1].toUpperCase();
  if (type.includes("text")) return "TXT";
  return type.split("/")[1]?.toUpperCase() || "File";
};

interface UploadPanelProps {
  onUploadComplete: () => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const totalFiles = [...files, ...acceptedFiles];

      if (totalFiles.length > 5) {
        toast.warning("You can upload a maximum of 5 files.", {
          description: `${totalFiles.length - 5} file(s) were not added.`,
        });
        // Only take the first 5 files or whatever is left from the quota
        const remainingSlots = Math.max(0, 5 - files.length);
        const newFiles = acceptedFiles.slice(0, remainingSlots);
        setFiles([...files, ...newFiles]);
      } else {
        setFiles(totalFiles);
      }
    },
    [files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
    },
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Perform the actual upload with progress tracking
      const response = await apiService.uploadFiles(
        files,
        (progressEvent: AxiosProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        }
      );

      if (response.success) {
        toast.success("Upload complete!", {
          description: response.message,
        });
        setFiles([]);
        onUploadComplete();
      } else {
        toast.error("Upload failed", {
          description: response.message || "Please try again.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "There was an error uploading your files.";
      toast.error("Upload failed", {
        description: errorMessage,
      });
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">File Upload</h2>
        <p className="text-muted-foreground text-sm">
          Upload up to 5 documents for analysis
        </p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 mb-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-center text-muted-foreground font-medium">
          {isDragActive ? (
            "Drop the files here..."
          ) : (
            <>
              Drag & drop files, or <span className="text-primary">browse</span>
              <br />
              <span className="text-sm font-normal">
                PDF, DOCX, PPTX, XLSX, TXT supported
              </span>
            </>
          )}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mb-4 flex-1 overflow-auto">
          <div className="text-sm mb-2 font-medium flex items-center justify-between">
            <span>Files ({files.length}/5)</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear all
            </Button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="file-item group">
                <span className="mr-2 text-lg">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px] mr-2">
                      {getFileTypeLabel(file.type)}
                    </span>
                    <span>{Math.round(file.size / 1024)} KB</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-70 group-hover:opacity-100"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="my-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="mt-auto">
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading
            ? "Uploading..."
            : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
};

export default UploadPanel;
