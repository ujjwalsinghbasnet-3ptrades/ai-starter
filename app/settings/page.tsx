"use client";

import { ModelConfiguration } from "@/components/settings/model-configuration";
import { ProviderSelector } from "@/components/settings/provider-selector";
import { TokenEstimator } from "@/components/settings/token-estimator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-border/40 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-primary">AI Agent</span>
            <span className="text-muted-foreground">Configuration</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <Tabs defaultValue="providers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="estimation">Token Estimation</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Provider Configuration</CardTitle>
                <CardDescription>
                  Select and configure the AI providers you want to use with
                  your agent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderSelector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Selection & Pricing</CardTitle>
                <CardDescription>
                  Configure models and their associated costs per token.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModelConfiguration />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Estimation</CardTitle>
                <CardDescription>
                  Estimate token usage and costs for text or uploaded files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TokenEstimator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
