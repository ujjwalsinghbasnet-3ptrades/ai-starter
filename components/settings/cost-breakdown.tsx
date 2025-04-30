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

interface Provider {
  id: string;
  name: string;
  enabled: boolean;
  models: Array<{
    id: string;
    name: string;
    unitSize: number;
    inputCost: number;
    outputCost: number;
    isImageModel: boolean;
  }>;
}

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
          return config.providers.filter((p: Provider) => p.enabled);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Cost Breakdown</h3>
        <Badge variant="outline" className="font-mono">
          <DollarSign className="size-3 mr-1" />
          {totalCost.toFixed(4)}
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Input Tokens</TableHead>
            <TableHead className="text-right">Output Tokens</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeProviders.map((provider: Provider) => {
            const providerCosts = tokenization.estimatedCost[provider.id] || {};
            const tokenCount = tokenization.tokenCounts[provider.id] || 0;

            return provider.models.map((model) => {
              const cost = providerCosts[model.id] || 0;
              const outputTokens = model.isImageModel
                ? 0
                : Math.round(tokenCount * 0.3);

              return (
                <TableRow key={`${provider.id}-${model.id}`}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>{model.name}</TableCell>
                  <TableCell className="text-right">
                    {tokenCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {outputTokens.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${cost.toFixed(4)}
                  </TableCell>
                </TableRow>
              );
            });
          })}
        </TableBody>
      </Table>
    </div>
  );
}
