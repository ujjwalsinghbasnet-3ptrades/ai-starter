"use client";

import type React from "react";

import { setProviderModelCookie } from "@/app/(chat)/actions";
import { getProviders } from "@/app/(chat)/actions/providers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AI_PROVIDER_CONFIG_KEY } from "@/lib/constants";
import type { Provider } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import {
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";
export function ProviderSelector({
  selectedProviderModelId,
  className,
}: {
  selectedProviderModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticProviderId, setOptimisticProviderId] = useOptimistic(
    selectedProviderModelId.split(":")[0] || ""
  );
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(
    selectedProviderModelId.split(":")[1] || ""
  );
  console.log({
    optimisticModelId,
    selectedProviderModelId,
    optimisticProviderId,
  });
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(
    null
  );
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);

  const selectedProvider = useMemo(
    () => availableProviders.find((p) => p.id === optimisticProviderId),
    [optimisticProviderId, availableProviders]
  );

  const selectedModel = useMemo(() => {
    if (!selectedProvider || !optimisticModelId) return null;
    return selectedProvider.models.find(
      (m) => m.id === optimisticModelId && m.enabled
    );
  }, [selectedProvider, optimisticModelId]);

  const displayModel = useMemo(() => {
    if (selectedModel) return selectedModel;
    if (!selectedProvider) return null;

    const defaultModels = localStorage.getItem("ai-provider-config")
      ? JSON.parse(localStorage.getItem("ai-provider-config") || "{}")
          ?.defaultModels || {}
      : {};

    const defaultModelId = defaultModels[selectedProvider.id];
    if (defaultModelId) {
      const model = selectedProvider.models.find(
        (m) => m.id === defaultModelId && m.enabled
      );
      if (model) return model;
    }

    return selectedProvider.models.find((m) => m.enabled) || null;
  }, [selectedProvider, selectedModel]);

  const toggleProviderExpanded = (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedProviderId === providerId) {
      setExpandedProviderId(null);
    } else {
      setExpandedProviderId(providerId);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    startTransition(() => {
      setOptimisticProviderId(provider.id);
      setOptimisticModelId("");

      const defaultModels = localStorage.getItem(AI_PROVIDER_CONFIG_KEY)
        ? JSON.parse(localStorage.getItem(AI_PROVIDER_CONFIG_KEY) || "{}")
            ?.defaultModels || {}
        : {};

      const defaultModelId =
        defaultModels[provider.id] ||
        provider.models.find((m) => m.enabled)?.id ||
        "";

      setProviderModelCookie(`${provider.id}:${defaultModelId}`);
    });
  };

  const handleModelSelect = (providerId: string, modelId: string) => {
    setOpen(false);

    startTransition(() => {
      setOptimisticProviderId(providerId);
      setOptimisticModelId(modelId);

      setProviderModelCookie(`${providerId}:${modelId}`);
    });
  };

  useEffect(() => {
    const fetchActiveProviders = async () => {
      const { data } = await getProviders();
      setAvailableProviders(data);
    };
    fetchActiveProviders();
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          type="button"
          variant="outline"
          className="md:px-2 md:h-[34px]"
          data-testid="provider-selector"
        >
          <span className="flex items-center">
            <span className="text-sm font-medium">
              {selectedProvider?.name}
            </span>
            {displayModel && (
              <span className="flex items-center text-xs text-muted-foreground ml-1 leading-none">
                : {displayModel.name}
              </span>
            )}
          </span>
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        <DropdownMenuLabel>Select AI Provider & Model</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <RadioGroup
          value={optimisticProviderId}
          onValueChange={(value) => {
            const provider = availableProviders.find((p) => p.id === value);
            if (provider) {
              handleProviderSelect(provider);
            }
          }}
          className="space-y-1 py-1"
        >
          {availableProviders.map((provider) => {
            const { id, name, description, models } = provider;
            const enabledModels = models.filter((m) => m.enabled);
            const isExpanded = expandedProviderId === id;
            const isSelected = id === optimisticProviderId;

            const defaultModels = localStorage.getItem(AI_PROVIDER_CONFIG_KEY)
              ? JSON.parse(localStorage.getItem(AI_PROVIDER_CONFIG_KEY) || "{}")
                  ?.defaultModels || {}
              : {};
            const defaultModelId = defaultModels[id] || enabledModels[0]?.id;

            return (
              <div key={id} className="px-1">
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "text-left flex items-center justify-between w-full rounded-md px-2 py-2 cursor-pointer hover:bg-accent",
                      isSelected && !optimisticModelId ? "bg-accent/50" : ""
                    )}
                    onClick={() => handleProviderSelect(provider)}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <RadioGroupItem
                        value={id}
                        id={`provider-${id}`}
                        className="mt-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center ml-2">
                      {enabledModels.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-6 p-0"
                          onClick={(e) => toggleProviderExpanded(id, e)}
                        >
                          {isExpanded ? (
                            <ChevronDownIcon size={16} />
                          ) : (
                            <ChevronRightIcon size={16} />
                          )}
                        </Button>
                      )}
                    </div>
                  </Button>
                </div>

                {enabledModels.length > 0 && isExpanded && (
                  <div className="pl-9 pr-2 py-1 mt-1 border-l-2 border-muted ml-3">
                    <RadioGroup
                      value={
                        id === optimisticProviderId
                          ? optimisticModelId || defaultModelId
                          : defaultModelId
                      }
                      onValueChange={(value) => handleModelSelect(id, value)}
                      className="space-y-1"
                    >
                      {enabledModels.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-start space-x-2 rounded-md px-2 py-1.5 hover:bg-accent"
                        >
                          <RadioGroupItem
                            value={model.id}
                            id={`${id}-${model.id}`}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`${id}-${model.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {model.name}
                            </Label>
                            <p className="text-xs text-muted-foreground truncate">
                              {model.description}
                            </p>
                          </div>
                          {id === optimisticProviderId &&
                            model.id === optimisticModelId && (
                              <CheckCircleFillIcon size={16} />
                            )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
