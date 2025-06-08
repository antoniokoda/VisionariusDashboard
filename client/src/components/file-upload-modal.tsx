import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Trash2, X, ExternalLink, Download, Eye } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFile = () => {
    if (newFileUrl.trim()) {
      const updatedFiles = [...files, newFileUrl.trim()];
      setFiles(updatedFiles);
      onFilesUpdate(updatedFiles);
      setNewFileUrl("");
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      // Create file objects with metadata for proper handling
      const fileObjects = Array.from(selectedFiles).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        isLocal: true
      }));
      
      const fileEntries = fileObjects.map(f => JSON.stringify(f));
      const updatedFiles = [...files, ...fileEntries];
      setFiles(updatedFiles);
      onFilesUpdate(updatedFiles);
    }
  };

  const getFileInfo = (fileEntry: string) => {
    try {
      return JSON.parse(fileEntry);
    } catch {
      // Legacy format - just a string
      return { name: fileEntry, isLocal: false, url: fileEntry };
    }
  };

  const handleViewFile = (fileEntry: string) => {
    const fileInfo = getFileInfo(fileEntry);
    if (fileInfo.url) {
      window.open(fileInfo.url, '_blank');
    }
  };

  const handleDownloadFile = (fileEntry: string) => {
    const fileInfo = getFileInfo(fileEntry);
    if (fileInfo.url) {
      const link = document.createElement('a');
      link.href = fileInfo.url;
      link.download = fileInfo.name || 'download';
      link.click();
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
          <DialogTitle>
            Manage Client Files
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
          />

          {/* Drag and Drop Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <p className="text-neutral-600 mb-2">Drag and drop files here</p>
            <p className="text-sm text-neutral-500 mb-4">or</p>
            <Button 
              variant="default" 
              onClick={(e) => {
                e.stopPropagation();
                handleFileSelect();
              }}
            >
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
                {files.map((file, index) => {
                  const fileInfo = getFileInfo(file);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div className="flex flex-col">
                          <span className="text-sm text-neutral-700 truncate max-w-[200px]">
                            {fileInfo.name}
                          </span>
                          {fileInfo.size && (
                            <span className="text-xs text-neutral-500">
                              {(fileInfo.size / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewFile(file)}
                          className="text-blue-500 hover:text-blue-700 h-8 w-8"
                          title="View file"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadFile(file)}
                          className="text-green-500 hover:text-green-700 h-8 w-8"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 h-8 w-8"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
