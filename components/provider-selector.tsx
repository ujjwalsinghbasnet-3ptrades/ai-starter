import { setProviderCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getEnabledProviders } from "@/lib/providers/provider-list";
import { cn } from "@/lib/utils";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

export function ProviderSelector({
  selectedProviderId,
  className,
}: {
  selectedProviderId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticProviderId, setOptimisticProviderId] =
    useOptimistic(selectedProviderId);
  const availableProviders = useMemo(() => getEnabledProviders(), []);

  const selectedProvider = useMemo(
    () => availableProviders.find((p) => p.id === optimisticProviderId),
    [optimisticProviderId, availableProviders]
  );

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
          {selectedProvider?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableProviders.map((provider) => {
          const { id, name, description } = provider;
          return (
            <DropdownMenuItem
              data-testid={`provider-selector-item-${id}`}
              key={provider.id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticProviderId(id);
                  setProviderCookie(id);
                });
              }}
              data-active={id === optimisticProviderId}
              asChild
            >
              <Button
                type="button"
                variant="ghost"
                className="gap-4 group/item flex flex-row justify-between items-center w-full h-auto"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {description}
                  </div>
                </div>
                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </Button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
