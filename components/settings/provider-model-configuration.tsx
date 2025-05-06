"use client";

import React, { createElement, useEffect, useState } from "react";

import { addCustomModelAction } from "@/app/(chat)/actions/models";
import {
  getUserSettings,
  updateUserSettings,
} from "@/app/(chat)/actions/user-settings";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Provider } from "@/lib/types";
import {
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  CloudCog,
  Edit2,
  Info,
  Plus,
  Save,
  Sparkle,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { toast } from "../toast";

const iconMap: Record<string, any> = {
  Sparkle,
  Bot,
  CloudCog,
  BrainCircuit,
  Zap,
};

export function ProviderModelConfiguration() {
  const session = useSession();
  const user = session?.data?.user;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string>("");
  const [defaultModels, setDefaultModels] = useState<Record<string, string>>(
    {}
  );
  const [expandedProviders, setExpandedProviders] = useState<
    Record<string, boolean>
  >({});
  const [editingModel, setEditingModel] = useState<{
    providerId: string;
    modelId: string;
  } | null>(null);
  const [tempCosts, setTempCosts] = useState<{
    inputCost: string;
    outputCost: string;
  }>({ inputCost: "", outputCost: "" });
  const [newModel, setNewModel] = useState<{
    name: string;
    description: string;
    inputCost: string;
    outputCost: string;
    unitSize: string;
    maxTokens: string;
  }>({
    name: "",
    description: "",
    inputCost: "0.001",
    outputCost: "0.002",
    unitSize: "1000",
    maxTokens: "16000",
  });
  const [addingModelForProvider, setAddingModelForProvider] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { providers, defaultProviderId } = await getUserSettings();
        if (providers) {
          setProviders(providers);
          if (defaultProviderId) {
            setDefaultProvider(defaultProviderId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
        toast({
          type: "error",
          description: "Failed to load provider configuration.",
        });
      }
    };

    fetchProviders();
  }, []);

  const toggleProviderEnabled = (id: string) => {
    setProviders(
      providers.map((provider) =>
        provider.id === id
          ? { ...provider, enabled: !provider.enabled }
          : provider
      )
    );
  };

  const toggleProviderExpanded = (id: string) => {
    setExpandedProviders({
      ...expandedProviders,
      [id]: !expandedProviders[id],
    });
  };

  const toggleModelEnabled = (providerId: string, modelId: string) => {
    setProviders(
      providers.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              models: provider.models.map((model) =>
                model.id === modelId
                  ? { ...model, enabled: !model.enabled }
                  : model
              ),
            }
          : provider
      )
    );
  };

  const handleDefaultProviderChange = (id: string) => {
    setDefaultProvider(id);
  };

  const handleDefaultModelChange = (providerId: string, modelId: string) => {
    setDefaultModels({
      ...defaultModels,
      [providerId]: modelId,
    });
  };

  const startEditing = (providerId: string, modelId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;

    const model = provider.models.find((m) => m.id === modelId);
    if (!model) return;

    setTempCosts({
      inputCost: model.inputCost.toString(),
      outputCost: model.outputCost.toString(),
    });
    setEditingModel({ providerId, modelId });
  };

  const saveModelCosts = () => {
    if (!editingModel) return;

    const { providerId, modelId } = editingModel;

    setProviders(
      providers.map((provider) => {
        if (provider.id === providerId) {
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

  // const resetToDefaultCosts = (providerId: string, modelId: string) => {
  //   const originalProvider = providersList.find(
  //     (p: Provider) => p.id === providerId
  //   );
  //   if (!originalProvider) return;

  //   const originalModel = originalProvider.models.find(
  //     (m: Model) => m.id === modelId
  //   );
  //   if (!originalModel) return;

  //   setProviders(
  //     providers.map((provider) => {
  //       if (provider.id === providerId) {
  //         const updatedModels = provider.models.map((model) => {
  //           if (model.id === modelId) {
  //             return {
  //               ...model,
  //               inputCost: originalModel.inputCost,
  //               outputCost: originalModel.outputCost,
  //               customCost: false,
  //             };
  //           }
  //           return model;
  //         });
  //         return { ...provider, models: updatedModels };
  //       }
  //       return provider;
  //     })
  //   );

  //   toast({
  //     type: "success",
  //     description:
  //       "This model's costs have been reset to their default values.",
  //   });
  // };

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

  const saveSettings = () => {
    try {
      const settingsToUpdate = {
        userId: user?.id ?? "",
        createdAt: null,
        updatedAt: null,
        defaultProviderId: defaultProvider,
        providerSettings: providers.reduce((acc, provider) => {
          acc[provider.id] = {
            enabled: provider.enabled,
            defaultModelId: defaultModels[provider.id],
          };
          return acc;
        }, {} as Record<string, { enabled: boolean; defaultModelId?: string }>),
        modelSettings: providers.reduce(
          (acc, provider) => {
            provider.models.forEach((model) => {
              acc[model.id] = {
                enabled: model.enabled || false,
                customInputCost: model.inputCost || 0,
                customOutputCost: model.outputCost || 0,
              };
            });
            return acc;
          },
          {} as Record<
            string,
            {
              enabled: boolean;
              customInputCost: number;
              customOutputCost: number;
            }
          >
        ),
      };

      if (user?.id) {
        updateUserSettings(settingsToUpdate);
      }

      toast({
        type: "success",
        description: "Your provider and model configuration has been updated.",
      });
    } catch (error) {
      console.error("Failed to update user settings:", error);
      toast({
        type: "error",
        description: "Failed to update provider and model configuration.",
      });
    }
  };

  const resetNewModelForm = () => {
    setNewModel({
      name: "",
      description: "",
      inputCost: "0.001",
      outputCost: "0.002",
      unitSize: "1000",
      maxTokens: "16000",
    });
    setAddingModelForProvider(null);
  };

  const handleNewModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewModel({
      ...newModel,
      [name]: value,
    });
  };

  const addNewModel = () => {
    if (!addingModelForProvider) return;

    const modelId = newModel.name.toLowerCase().replace(/\s+/g, "-");
    const model = {
      id: modelId,
      name: newModel.name,
      description: newModel.description,
      inputCost: Number.parseFloat(newModel.inputCost) || 0.001,
      outputCost: Number.parseFloat(newModel.outputCost) || 0.002,
      unitSize: Number.parseInt(newModel.unitSize) || 1000,
      maxTokens: Number.parseInt(newModel.maxTokens) || 16000,
      enabled: true,
      customCost: true,
    };
    addCustomModelAction({ providerId: addingModelForProvider, model });
    setProviders(
      providers.map((provider) => {
        if (provider.id === addingModelForProvider) {
          return {
            ...provider,
            models: [
              ...provider.models,
              {
                id: modelId,
                name: newModel.name,
                description: newModel.description,
                inputCost: Number.parseFloat(newModel.inputCost) || 0.001,
                outputCost: Number.parseFloat(newModel.outputCost) || 0.002,
                unitSize: Number.parseInt(newModel.unitSize) || 1000,
                maxTokens: Number.parseInt(newModel.maxTokens) || 16000,
                enabled: true,
                customCost: true,
              },
            ],
          };
        }
        return provider;
      })
    );

    resetNewModelForm();

    toast({
      type: "success",
      description: "New model has been added successfully.",
    });
  };

  const deleteModel = (providerId: string, modelId: string) => {
    setProviders(
      providers.map((provider) => {
        if (provider.id === providerId) {
          return {
            ...provider,
            models: provider.models.filter((model) => model.id !== modelId),
          };
        }
        return provider;
      })
    );

    // If this was the default model, reset the default
    if (defaultModels[providerId] === modelId) {
      const updatedDefaultModels = { ...defaultModels };
      delete updatedDefaultModels[providerId];
      setDefaultModels(updatedDefaultModels);
    }

    toast({
      type: "success",
      description: "Model has been deleted successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">AI Providers & Models</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Configure AI providers and their models. Enable or disable
                  providers and models, set default options, and customize
                  pricing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid gap-4">
          {providers.map((provider) => {
            const Icon = Sparkle;
            return (
              <Collapsible
                key={provider.id}
                open={expandedProviders[provider.id]}
                onOpenChange={() => toggleProviderExpanded(provider.id)}
                className={`rounded-lg border transition-all ${
                  provider.enabled
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        {expandedProviders[provider.id] ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <div
                      className={`size-10 rounded-md flex items-center justify-center ${
                        provider.enabled ? provider.bgColor : "bg-transparent"
                      }`}
                    >
                      {createElement(Icon, {
                        className: `size-5 ${
                          provider.enabled
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`,
                      })}
                    </div>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {defaultProvider === provider.id && provider.enabled && (
                      <div className="hidden sm:flex items-center text-sm text-primary">
                        <Star className="size-3.5 mr-1 fill-primary text-primary" />
                        Default
                      </div>
                    )}
                    <Switch
                      checked={provider.enabled}
                      onCheckedChange={() => toggleProviderEnabled(provider.id)}
                    />
                  </div>
                </div>

                <CollapsibleContent>
                  {provider.enabled && (
                    <div className="p-4 pt-0 space-y-4">
                      <div className="border-t border-border/40 pt-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                          <h4 className="text-sm font-medium">Models</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <Label
                              htmlFor={`default-model-${provider.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Default Model:
                            </Label>
                            <RadioGroup
                              id={`default-model-${provider.id}`}
                              value={
                                defaultModels[provider.id] ||
                                provider.models[0]?.id
                              }
                              onValueChange={(value) =>
                                handleDefaultModelChange(provider.id, value)
                              }
                              className="flex flex-wrap items-center gap-2"
                            >
                              {provider.models
                                .filter((model) => model.enabled)
                                .map((model) => (
                                  <div
                                    key={model.id}
                                    className="flex items-center space-x-1"
                                  >
                                    <RadioGroupItem
                                      value={model.id}
                                      id={`${provider.id}-${model.id}`}
                                    />
                                    <Label
                                      htmlFor={`${provider.id}-${model.id}`}
                                      className="text-xs"
                                    >
                                      {model.name}
                                    </Label>
                                  </div>
                                ))}
                            </RadioGroup>
                          </div>
                        </div>

                        <div className="space-y-3 mt-2">
                          {provider.models.map((model) => (
                            <div
                              key={model.id}
                              className={`rounded-md border p-3 ${
                                model.enabled ? "bg-card" : "bg-muted/30"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <Switch
                                    checked={model.enabled}
                                    onCheckedChange={() =>
                                      toggleModelEnabled(provider.id, model.id)
                                    }
                                  />
                                  <div>
                                    <div className="font-medium flex items-center flex-wrap">
                                      {model.name}
                                      {defaultModels[provider.id] ===
                                        model.id && (
                                        <span className="ml-2 text-xs text-primary flex items-center">
                                          <Star className="size-3 mr-1 fill-primary text-primary" />
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {model.description}
                                    </div>
                                  </div>
                                </div>

                                {editingModel?.providerId === provider.id &&
                                editingModel?.modelId === model.id ? (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={cancelEditing}
                                      className="size-7"
                                    >
                                      <X className="size-3.5" />
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="icon"
                                      onClick={saveModelCosts}
                                      className="size-7"
                                    >
                                      <Save className="size-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        deleteModel(provider.id, model.id)
                                      }
                                      className="size-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        startEditing(provider.id, model.id)
                                      }
                                      className="size-7"
                                      disabled={!model.enabled}
                                    >
                                      <Edit2 className="size-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {editingModel?.providerId === provider.id &&
                              editingModel?.modelId === model.id ? (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`input-cost-${model.id}`}
                                      className="text-xs"
                                    >
                                      Input Cost (per {model.unitSize} tokens)
                                    </Label>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        $
                                      </span>
                                      <Input
                                        id={`input-cost-${model.id}`}
                                        value={tempCosts.inputCost}
                                        onChange={(e) =>
                                          handleInputChange(e, "inputCost")
                                        }
                                        className="pl-6"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`output-cost-${model.id}`}
                                      className="text-xs"
                                    >
                                      Output Cost (per {model.unitSize} tokens)
                                    </Label>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        $
                                      </span>
                                      <Input
                                        id={`output-cost-${model.id}`}
                                        value={tempCosts.outputCost}
                                        onChange={(e) =>
                                          handleInputChange(e, "outputCost")
                                        }
                                        className="pl-6"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Input:
                                    </span>{" "}
                                    <span
                                      className={
                                        model.customCost
                                          ? "text-primary font-medium"
                                          : ""
                                      }
                                    >
                                      ${model.inputCost.toFixed(6)} /{" "}
                                      {model.unitSize} tokens
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Output:
                                    </span>{" "}
                                    <span
                                      className={
                                        model.customCost
                                          ? "text-primary font-medium"
                                          : ""
                                      }
                                    >
                                      ${model.outputCost.toFixed(6)} /{" "}
                                      {model.unitSize} tokens
                                    </span>
                                  </div>
                                  {model.customCost && (
                                    <div className="col-span-1 sm:col-span-2 mt-1">
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs"
                                        onClick={() => {}}
                                      >
                                        Reset to default pricing
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {provider.enabled && (
                          <div className="mt-4">
                            <Dialog
                              open={addingModelForProvider === provider.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setAddingModelForProvider(provider.id);
                                } else {
                                  resetNewModelForm();
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <Plus className="size-3.5 mr-1" />
                                  Add New Model
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Add New Model to {provider.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Create a custom model with your own
                                    specifications and pricing.
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="model-name">
                                      Model Name
                                    </Label>
                                    <Input
                                      id="model-name"
                                      name="name"
                                      value={newModel.name}
                                      onChange={handleNewModelChange}
                                      placeholder="e.g., Custom GPT-4"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="model-description">
                                      Description
                                    </Label>
                                    <Input
                                      id="model-description"
                                      name="description"
                                      value={newModel.description}
                                      onChange={handleNewModelChange}
                                      placeholder="e.g., Custom model for specific tasks"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="input-cost">
                                        Input Cost
                                      </Label>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                          $
                                        </span>
                                        <Input
                                          id="input-cost"
                                          name="inputCost"
                                          value={newModel.inputCost}
                                          onChange={handleNewModelChange}
                                          className="pl-6"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="output-cost">
                                        Output Cost
                                      </Label>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                          $
                                        </span>
                                        <Input
                                          id="output-cost"
                                          name="outputCost"
                                          value={newModel.outputCost}
                                          onChange={handleNewModelChange}
                                          className="pl-6"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="unit-size">
                                        Unit Size (tokens)
                                      </Label>
                                      <Input
                                        id="unit-size"
                                        name="unitSize"
                                        value={newModel.unitSize}
                                        onChange={handleNewModelChange}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="max-tokens">
                                        Max Tokens
                                      </Label>
                                      <Input
                                        id="max-tokens"
                                        name="maxTokens"
                                        value={newModel.maxTokens}
                                        onChange={handleNewModelChange}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={resetNewModelForm}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={addNewModel}
                                    disabled={!newModel.name.trim()}
                                  >
                                    Add Model
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Default Provider</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  The default provider will be used when no specific provider is
                  selected.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <RadioGroup
          value={defaultProvider}
          onValueChange={handleDefaultProviderChange}
          className="grid gap-4"
        >
          {providers
            .filter((provider) => provider.enabled)
            .map((provider) => {
              const Icon = provider.icon;
              return (
                <div
                  key={provider.id}
                  className="flex items-center space-x-2 rounded-md border p-4"
                >
                  <RadioGroupItem
                    value={provider.id}
                    id={`default-${provider.id}`}
                  />
                  <Label
                    htmlFor={`default-${provider.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`size-6 rounded flex items-center justify-center ${provider.bgColor}`}
                      >
                        {React.createElement(Icon, {
                          className: "size-3.5 text-white",
                        })}
                      </div>
                      <span>{provider.name}</span>
                      {defaultModels[provider.id] && (
                        <span className="text-xs text-muted-foreground">
                          (Default model:{" "}
                          {
                            provider.models.find(
                              (m) => m.id === defaultModels[provider.id]
                            )?.name
                          }
                          )
                        </span>
                      )}
                    </div>
                  </Label>
                  {defaultProvider === provider.id && (
                    <div className="text-sm text-primary flex items-center">
                      <Check className="size-4 mr-1" />
                      Selected
                    </div>
                  )}
                </div>
              );
            })}
        </RadioGroup>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={saveSettings} className="w-full">
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
