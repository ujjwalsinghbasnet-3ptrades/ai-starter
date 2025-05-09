"use client";
import { CostBreakdown } from "@/components/settings/cost-breakdown";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { extractPdfText, readFileContent } from "@/lib/file-utils";
import { estimateTokens } from "@/lib/providers/tokenization";
import type { TokenizationResult } from "@/lib/types";
import { FileText, Info, Loader2, MessageSquare, Upload } from "lucide-react";
import { useState } from "react";

export function TokenEstimator() {
  const [inputText, setInputText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tokenization, setTokenization] = useState<TokenizationResult | null>(
    null
  );
  const [estimateTab, setEstimateTab] = useState<string>("text");

  const estimateTextTokens = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const result = await estimateTokens(inputText);
      console.log({ result });
      setTokenization(result);
    } catch (error) {
      console.error("Error estimating tokens:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      let fileContent = "";

      if (file.type === "application/pdf") {
        fileContent = await extractPdfText(file);
      } else {
        fileContent = await readFileContent(file);
      }

      const limitedContent = fileContent.substring(0, 10000);
      const result = await estimateTokens(limitedContent);
      setTokenization(result);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileSizeLabel = () => {
    if (!file) return "";

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB < 1) {
      return `${(file.size / 1024).toFixed(2)} KB`;
    }
    return `${sizeMB.toFixed(2)} MB`;
  };

  const clearFile = () => {
    setFile(null);
    setTokenization(null);
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={estimateTab}
        onValueChange={setEstimateTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">
            <MessageSquare className="size-4 mr-2" />
            Text Input
          </TabsTrigger>
          <TabsTrigger value="file">
            <FileText className="size-4 mr-2" />
            File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="text-input">Enter text to estimate tokens</Label>
              {tokenization && (
                <div className="flex gap-2">
                  {Object.entries(tokenization.tokenCounts).map(
                    ([providerId, count]) => (
                      <span
                        key={providerId}
                        className="text-sm text-muted-foreground"
                      >
                        {providerId}: {count.toLocaleString()} tokens
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
            <Textarea
              id="text-input"
              placeholder="Paste text here to estimate token count and costs..."
              className="min-h-32 resize-y"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button
              onClick={estimateTextTokens}
              disabled={!inputText.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Estimating tokens...
                </>
              ) : (
                "Estimate Tokens"
              )}
            </Button>
          </div>

          {tokenization && !isProcessing && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="space-y-1.5">
                <Label className="text-sm">Token Distribution</Label>
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        100,
                        (Math.max(...Object.values(tokenization.tokenCounts)) /
                          1000) *
                          4
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>0</span>
                  <span>250</span>
                  <span>500</span>
                  <span>750</span>
                  <span>1000+</span>
                </div>
              </div>

              <CostBreakdown tokenization={tokenization} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="file" className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="file-input">
                Upload a file to estimate tokens
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Supported file types: .txt, .md, .rtf, .csv, .json
                      <br />
                      (PDF support is simulated in this demo)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {!file ? (
              // biome-ignore lint/nursery/noStaticElementInteractions: <explanation>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="size-8 mx-auto mb-4 text-muted-foreground" />
                <div className="text-sm font-medium mb-1">
                  Click to upload or drag and drop
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  TXT, MD, RTF, CSV, JSON, PDF (up to 10MB)
                </p>
                <Button variant="outline" size="sm">
                  Select File
                </Button>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.rtf,.csv,.json,.pdf"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="size-8 text-primary" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {getFileSizeLabel()}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFile}>
                    Remove
                  </Button>
                </div>

                <Button
                  onClick={processFile}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Analyzing file...
                    </>
                  ) : (
                    "Analyze File"
                  )}
                </Button>
              </div>
            )}
          </div>

          {tokenization && !isProcessing && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="rounded-md bg-muted p-4">
                <h4 className="text-sm font-medium mb-2">Analysis Results</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Token counts:</span>
                    <div className="flex flex-col items-end">
                      {Object.entries(tokenization.tokenCounts).map(
                        ([providerId, count]) => (
                          <span key={providerId} className="font-medium">
                            {providerId}: {count.toLocaleString()}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>File type:</span>
                    <span className="font-medium">
                      {file?.type || "text/plain"}
                    </span>
                  </div>
                </div>
              </div>

              <CostBreakdown tokenization={tokenization} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
