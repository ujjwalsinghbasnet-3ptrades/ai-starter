"use client";

import { getProviders } from "@/app/(chat)/actions/providers";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Provider, TokenizationResult } from "@/lib/types";
import { DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CostBreakdownProps {
  tokenization: TokenizationResult;
}

export function CostBreakdown({ tokenization }: CostBreakdownProps) {
  const [activeProviders, setActiveProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const fetchActiveProviders = async () => {
      const { data } = await getProviders();
      setActiveProviders(data);
    };
    fetchActiveProviders();
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
