"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AI_PROVIDER_CONFIG_KEY } from "@/lib/constants";
import { providersList } from "@/lib/providers/provider-list";
import type { Provider } from "@/lib/types";
import { Check, Info, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "../toast";
export function ProviderSelector() {
  const [providers, setProviders] = useState<Provider[]>(providersList);
  const [defaultProvider, setDefaultProvider] = useState<string>(
    providersList[0].id
  );

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(AI_PROVIDER_CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.providers) {
          // Merge saved configuration with original providers to preserve icon references
          const mergedProviders = providersList.map((originalProvider) => {
            const savedProvider = config.providers.find(
              (p: Provider) => p.id === originalProvider.id
            );
            if (savedProvider) {
              return {
                ...originalProvider,
                enabled: savedProvider.enabled,
              };
            }
            return originalProvider;
          });
          setProviders(mergedProviders);
        }
        if (config.defaultProvider) setDefaultProvider(config.defaultProvider);
      } catch (error) {
        console.error("Failed to load saved configuration:", error);
      }
    }
  }, []);

  // Save configuration when it changes
  useEffect(() => {
    const config = {
      providers,
      defaultProvider,
    };
    localStorage.setItem(AI_PROVIDER_CONFIG_KEY, JSON.stringify(config));
  }, [providers, defaultProvider]);

  const toggleProviderEnabled = (id: string) => {
    setProviders(
      providers.map((provider) =>
        provider.id === id
          ? { ...provider, enabled: !provider.enabled }
          : provider
      )
    );
  };

  const handleDefaultProviderChange = (id: string) => {
    setDefaultProvider(id);
  };

  const saveSettings = () => {
    toast({
      type: "success",
      description: "Your provider configuration has been updated.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Active Providers</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Enable or disable AI providers. Your agent will only use
                  enabled providers.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                provider.enabled
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`size-10 rounded-md flex items-center justify-center ${
                    provider.enabled ? provider.bgColor : "bg-transparent"
                  }`}
                >
                  {provider.icon && (
                    <provider.icon
                      className={`size-5 ${
                        provider.enabled
                          ? "text-white"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
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
                  <div className="flex items-center text-sm text-primary">
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
          ))}
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
            .map((provider) => (
              <div
                key={provider.id}
                className="flex items-center space-x-2 rounded-md border p-4"
              >
                <RadioGroupItem value={provider.id} id={provider.id} />
                <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`size-6 rounded flex items-center justify-center ${provider.bgColor}`}
                    >
                      {/* {provider.icon && (
                        <provider.icon
                          className="h-3.5 w-3.5 text-white"
                        />
                      )} */}
                    </div>
                    <span>{provider.name}</span>
                  </div>
                </Label>
                {defaultProvider === provider.id && (
                  <div className="text-sm text-primary flex items-center">
                    <Check className="size-4 mr-1" />
                    Selected
                  </div>
                )}
              </div>
            ))}
        </RadioGroup>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={saveSettings} className="w-full">
          Save Provider Configuration
        </Button>
      </div>
    </div>
  );
}
