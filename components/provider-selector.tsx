import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvailableProviders } from "@/lib/ai/providers/get-provider-list";
import type { AIProvider } from "@/lib/ai/providers/providers-config";
import { DEFAULT_PROVIDER } from "@/lib/ai/providers/providers-config";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

async function fetchAvailableProviders() {
  const res = await getAvailableProviders();
  return res;
}

export function ProviderSelector() {
  const [open, setOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSelect = async () => {
      try {
        const providers = await fetchAvailableProviders();
        setAvailableProviders(providers);
        const defaultProvider = providers.find((p) => p.selected);
        setSelectedProviderId(defaultProvider?.id || DEFAULT_PROVIDER);
      } catch (err) {
        setError("Failed to load providers");
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSelect();
  }, []);

  const selectedProvider = useMemo(
    () => availableProviders.find((p) => p.id === selectedProviderId),
    [selectedProviderId, availableProviders]
  );

  const handleProviderChange = async (providerId: string) => {
    try {
      await fetch("/api/providers", {
        method: "POST",
        body: JSON.stringify({ providerId }),
      });
      setSelectedProviderId(providerId);
    } catch (err) {
      setError("Failed to update provider");
      console.error("Error updating provider:", err);
    }
  };

  if (loading) return <Loader2 className="size-4 animate-spin" />;
  if (error) return <AlertCircle className="size-4" />;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
        )}
      >
        <Button
          variant="outline"
          className="md:px-2 md:h-[34px]"
          data-testid="provider-selector"
        >
          {selectedProvider?.name || "Select Provider"}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableProviders.map((provider) => (
          <DropdownMenuItem
            data-testid={`provider-selector-item-${provider.id}`}
            key={provider.id}
            onSelect={() => {
              setOpen(false);
              handleProviderChange(provider.id);
            }}
            data-active={provider.id === selectedProviderId}
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
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
