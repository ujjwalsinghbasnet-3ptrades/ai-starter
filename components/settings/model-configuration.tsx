"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AI_PROVIDER_CONFIG_KEY } from "@/lib/constants";
import { providersList } from "@/lib/providers/provider-list";
import type { Model, Provider } from "@/lib/types";
import { Edit2, Info, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "../toast";

export function ModelConfiguration() {
  const [providers, setProviders] = useState<Provider[]>(providersList);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    providersList.find((p) => p.enabled)?.id || providersList[0].id
  );
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [tempCosts, setTempCosts] = useState<{
    inputCost: string;
    outputCost: string;
  }>({ inputCost: "", outputCost: "" });

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(AI_PROVIDER_CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.providers) setProviders(config.providers);
      } catch (error) {
        console.error("Failed to load saved configuration:", error);
      }
    }
  }, []);

  // Save configuration when it changes
  useEffect(() => {
    const config = {
      providers,
      defaultProvider: localStorage.getItem(AI_PROVIDER_CONFIG_KEY)
        ? JSON.parse(localStorage.getItem(AI_PROVIDER_CONFIG_KEY) || "{}")
            ?.defaultProvider
        : providers.find((p) => p.enabled)?.id,
    };
    localStorage.setItem(AI_PROVIDER_CONFIG_KEY, JSON.stringify(config));
  }, [providers]);

  const selectedProvider =
    providers.find((p) => p.id === selectedProviderId) || providers[0];

  const startEditing = (modelId: string) => {
    const model = selectedProvider.models.find((m) => m.id === modelId);
    if (model) {
      setTempCosts({
        inputCost: model.inputCost.toString(),
        outputCost: model.outputCost.toString(),
      });
      setEditingModel(modelId);
    }
  };

  const saveModelCosts = (modelId: string) => {
    setProviders(
      providers.map((provider) => {
        if (provider.id === selectedProviderId) {
          const updatedModels = provider.models.map((model) => {
            if (model.id === modelId) {
              return {
                ...model,
                inputCost:
                  Number.parseFloat(tempCosts.inputCost) || model.inputCost,
                outputCost:
                  Number.parseFloat(tempCosts.outputCost) || model.outputCost,
                customCost: true,
              };
            }
            return model;
          });
          return { ...provider, models: updatedModels };
        }
        return provider;
      })
    );
    setEditingModel(null);

    toast({
      type: "success",
      description: "The cost settings for this model have been saved.",
    });
  };

  const cancelEditing = () => {
    setEditingModel(null);
  };

  const resetToDefaultCosts = (modelId: string) => {
    // Find the original costs from the initial provider list
    const originalProvider = providersList.find(
      (p: Provider) => p.id === selectedProviderId
    );
    if (!originalProvider) return;

    const originalModel = originalProvider.models.find(
      (m: Model) => m.id === modelId
    );
    if (!originalModel) return;

    setProviders(
      providers.map((provider) => {
        if (provider.id === selectedProviderId) {
          const updatedModels = provider.models.map((model) => {
            if (model.id === modelId) {
              return {
                ...model,
                inputCost: originalModel.inputCost,
                outputCost: originalModel.outputCost,
                customCost: false,
              };
            }
            return model;
          });
          return { ...provider, models: updatedModels };
        }
        return provider;
      })
    );

    toast({
      type: "success",
      description:
        "This model's costs have been reset to their default values.",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "inputCost" | "outputCost"
  ) => {
    const value = e.target.value;
    // Only allow positive numbers and up to 6 decimal places
    if (value === "" || /^(0|[1-9]\d*)(\.\d{0,6})?$/.test(value)) {
      setTempCosts({
        ...tempCosts,
        [field]: value,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Model Costs Configuration</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Configure the costs per {selectedProvider.models[0]?.unitSize}{" "}
                  tokens for each model. These values will be used to estimate
                  costs for your usage.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="provider-select">Select Provider</Label>
            <Select
              value={selectedProviderId}
              onValueChange={setSelectedProviderId}
            >
              <SelectTrigger id="provider-select" className="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`size-4 rounded flex items-center justify-center ${provider.bgColor}`}
                        />
                        <span>{provider.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Input Cost</TableHead>
                  <TableHead>Output Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProvider.models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {model.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingModel === model.id ? (
                        <Input
                          value={tempCosts.inputCost}
                          onChange={(e) => handleInputChange(e, "inputCost")}
                          placeholder="0.00"
                          className="w-24"
                        />
                      ) : (
                        <div
                          className={
                            model.customCost ? "text-primary font-medium" : ""
                          }
                        >
                          ${model.inputCost.toFixed(6)} / {model.unitSize}{" "}
                          tokens
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingModel === model.id ? (
                        <Input
                          value={tempCosts.outputCost}
                          onChange={(e) => handleInputChange(e, "outputCost")}
                          placeholder="0.00"
                          className="w-24"
                        />
                      ) : (
                        <div
                          className={
                            model.customCost ? "text-primary font-medium" : ""
                          }
                        >
                          ${model.outputCost.toFixed(6)} / {model.unitSize}{" "}
                          tokens
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingModel === model.id ? (
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                          >
                            <X className="size-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => saveModelCosts(model.id)}
                          >
                            <Save className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          {model.customCost && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetToDefaultCosts(model.id)}
                            >
                              Reset
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => startEditing(model.id)}
                          >
                            <Edit2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <div className="rounded-md bg-muted p-4">
          <h4 className="text-sm font-medium mb-2">About Model Costs</h4>
          <p className="text-sm text-muted-foreground">
            Costs are specified per{" "}
            {selectedProvider.models[0]?.unitSize || 1000} tokens. Different
            models have different pricing for input (prompts/uploads) and output
            (generated responses). These costs are used to calculate estimated
            expenses for your AI usage.
          </p>
        </div>
      </div>
    </div>
  );
}
