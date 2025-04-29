"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AI_PROVIDER_CONFIG_KEY } from "@/lib/constants";
import { providersList } from "@/lib/providers/provider-list";
import type { TokenizationResult } from "@/lib/types";
import { DollarSign } from "lucide-react";
import { useMemo } from "react";

interface CostBreakdownProps {
  tokenization: TokenizationResult;
}

export function CostBreakdown({ tokenization }: CostBreakdownProps) {
  const activeProviders = useMemo(() => {
    const savedConfig = localStorage.getItem(AI_PROVIDER_CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.providers) {
          return config.providers.filter((p: any) => p.enabled);
        }
      } catch (error) {
        console.error("Failed to load saved configuration:", error);
      }
    }
    return [providersList[0]];
  }, []);

  // Calculate total costs
  const totalCost = useMemo(() => {
    let sum = 0;
    Object.entries(tokenization.estimatedCost || {}).forEach(
      ([providerId, models]) => {
        Object.values(models).forEach((cost) => {
          sum += cost;
        });
      }
    );
    return sum;
  }, [tokenization]);

  const getCostsByProvider = () => {
    const results = [];

    for (const provider of activeProviders) {
      if (!tokenization.estimatedCost[provider.id]) continue;

      const providerModels = provider.models;
      const providerCosts = tokenization.estimatedCost[provider.id];

      for (const [modelId, cost] of Object.entries(providerCosts)) {
        const model = providerModels.find((m: any) => m.id === modelId);
        if (!model) continue;

        const inputTokens = tokenization.tokenCount;
        const inputCostRaw = (inputTokens / model.unitSize) * model.inputCost;

        // Estimate output tokens (typically 20-50% of input for text generation)
        // For simplicity, we'll use 30%
        const outputTokens = model.isImageModel
          ? 0
          : Math.round(inputTokens * 0.3);
        const outputCostRaw =
          (outputTokens / model.unitSize) * model.outputCost;

        results.push({
          providerId: provider.id,
          providerName: provider.name,
          providerColor: provider.bgColor,
          modelId,
          modelName: model.name,
          inputTokens,
          outputTokens,
          inputCost: inputCostRaw,
          outputCost: outputCostRaw,
          totalCost: inputCostRaw + outputCostRaw,
        });
      }
    }

    return results.sort((a, b) => a.totalCost - b.totalCost);
  };

  const costByProvider = getCostsByProvider();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Cost Breakdown</h3>
        <div className="flex items-center">
          <DollarSign className="size-4 mr-1 text-primary" />
          <span className="font-semibold">${totalCost.toFixed(4)}</span>
          <span className="text-xs text-muted-foreground ml-1">
            estimated total
          </span>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider / Model</TableHead>
              <TableHead className="text-right">Input</TableHead>
              <TableHead className="text-right">Output (est.)</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costByProvider.map((item, index) => (
              <TableRow key={`${item.providerId}-${item.modelId}`}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`text-muted-foreground ${item.providerColor}`}
                    >
                      {item.providerName}
                    </Badge>
                    <span>{item.modelName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">
                    {item.inputTokens.toLocaleString()} tokens
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${item.inputCost.toFixed(4)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {item.outputTokens > 0 ? (
                    <>
                      <div className="text-sm">
                        {item.outputTokens.toLocaleString()} tokens
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${item.outputCost.toFixed(4)}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">N/A</div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${item.totalCost.toFixed(4)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
        <p>
          These cost estimates are based on the configured prices per token.
          Output token estimates are calculated at approximately 30% of input
          tokens, which may vary in actual usage.
        </p>
      </div>
    </div>
  );
}
