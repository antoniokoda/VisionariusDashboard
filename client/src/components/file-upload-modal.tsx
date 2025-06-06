import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2, X } from "lucide-react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  currentFiles: string[];
  onFilesUpdate: (files: string[]) => void;
}

export function FileUploadModal({ 
  isOpen, 
  onClose, 
  clientId, 
  currentFiles, 
  onFilesUpdate 
}: FileUploadModalProps) {
  const [files, setFiles] = useState<string[]>(currentFiles);
  const [newFileUrl, setNewFileUrl] = useState("");

  const handleAddFile = () => {
    if (newFileUrl.trim()) {
      const updatedFiles = [...files, newFileUrl.trim()];
      setFiles(updatedFiles);
      onFilesUpdate(updatedFiles);
      setNewFileUrl("");
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesUpdate(updatedFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // In a real implementation, this would handle file uploads
    // For now, we'll just simulate adding a file
    const simulatedFileName = `uploaded_file_${Date.now()}.pdf`;
    const updatedFiles = [...files, simulatedFileName];
    setFiles(updatedFiles);
    onFilesUpdate(updatedFiles);
  }, [files, onFilesUpdate]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Manage Client Files
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <p className="text-neutral-600 mb-2">Drag and drop files here</p>
            <p className="text-sm text-neutral-500 mb-4">or</p>
            <Button variant="default">
              Choose Files
            </Button>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Or add file URL:</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                placeholder="https://example.com/file.pdf"
                className="flex-1 text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button onClick={handleAddFile} size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* File List */}
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Files ({files.length})
            </h4>
            
            {files.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No files uploaded</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-neutral-700 truncate max-w-[200px]">
                        {file}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
