
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, AlertTriangleIcon } from 'lucide-react';
import type { FinancialOptimizationInput, FinancialOptimizationOutput } from '@/ai/flows/financial-optimization-recommendations';
import { getFinancialOptimizationRecommendations } from '@/ai/flows/financial-optimization-recommendations';
import { Skeleton } from '@/components/ui/skeleton';

interface AiRecommendationsCardProps {
  financialInputs: FinancialOptimizationInput | null;
  isCalculating: boolean; // To prevent fetching AI when main data is stale
}

const AiRecommendationsCard: React.FC<AiRecommendationsCardProps> = ({ financialInputs, isCalculating }) => {
  const [recommendations, setRecommendations] = useState<FinancialOptimizationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!financialInputs) {
      setError("Financial inputs are not available to generate recommendations.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations(null); 
    try {
      const result = await getFinancialOptimizationRecommendations(financialInputs);
      setRecommendations(result);
    } catch (err) {
      console.error("Error fetching AI recommendations:", err);
      setError("Failed to fetch AI recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Clear recommendations if inputs are calculating to avoid stale advice
    if (isCalculating) {
        setRecommendations(null);
        setError(null);
    }
  }, [isCalculating]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground border-b pb-3 flex items-center">
          <Wand2 className="mr-2 h-6 w-6 text-primary" />
          AI Optimization Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered suggestions to enhance your revenue and profitability based on your current inputs.
        </p>
        <Button onClick={fetchRecommendations} disabled={isLoading || isCalculating || !financialInputs} className="mb-6 w-full sm:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate Recommendations
        </Button>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-md space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendations && recommendations.recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Recommended Strategies:</h3>
            {recommendations.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-border rounded-lg bg-card shadow-sm">
                <h4 className="font-semibold text-primary">{rec.metric}: <span className="text-accent">{rec.strategy}</span></h4>
                <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">Reasoning:</strong> {rec.reasoning}</p>
                <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">Potential Impact:</strong> {rec.potentialImpact}</p>
              </div>
            ))}
          </div>
        )}
        
        {recommendations && recommendations.recommendations.length === 0 && !isLoading && !error && (
            <p className="text-sm text-muted-foreground">No specific recommendations generated for the current inputs. Try adjusting your financial variables.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AiRecommendationsCard;
