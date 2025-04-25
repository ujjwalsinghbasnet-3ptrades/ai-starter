"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

import { getAvailableProviders } from "@/lib/ai/providers/get-provider-list";
import { AIProvider } from "@/lib/ai/providers/providers-config";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

export function ProviderSelector() {
  const [open, setOpen] = useState(false);
  const [optimisticProviderId, setOptimisticProviderId] =
    useState<string>("google");

  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>(
    []
  );

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getAvailableProviders();
      setAvailableProviders(res);
      const selectedProvider = res.find((provider) => provider.selected);
      if (selectedProvider) {
        setOptimisticProviderId(selectedProvider.id);
      }
    };
    fetchProviders();
  }, []);

  const selectedProvider = useMemo(
    () =>
      availableProviders.find(
        (provider) => provider.id === optimisticProviderId
      ),
    [optimisticProviderId, availableProviders]
  );

  const handleProviderChange = async (providerId: string) => {
    await fetch("/api/providers", {
      method: "POST",
      body: JSON.stringify({ providerId }),
    });
    setOptimisticProviderId(providerId);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
        )}
      >
        <Button
          data-testid="provider-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          {selectedProvider?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableProviders.map((provider) => {
          const { id } = provider;

          return (
            <DropdownMenuItem
              data-testid={`provider-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);
                handleProviderChange(id);
              }}
              data-active={id === optimisticProviderId}
              disabled={!provider.isConfigured}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{provider.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {provider.description}
                  </div>
                </div>

                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
