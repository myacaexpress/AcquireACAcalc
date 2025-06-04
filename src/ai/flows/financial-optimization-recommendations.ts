// financial-optimization-recommendations.ts
'use server';

/**
 * @fileOverview Provides AI-driven recommendations for optimizing financial inputs (lead cost, commission rates, enrollment fees) to optimize projected revenue and profitability.
 *
 * - getFinancialOptimizationRecommendations - A function that provides financial optimization recommendations.
 * - FinancialOptimizationInput - The input type for the getFinancialOptimizationRecommendations function.
 * - FinancialOptimizationOutput - The return type for the getFinancialOptimizationRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialProjectionSchema = z.object({
  totalRevenue: z.number(),
  totalExpenses: z.number(),
  totalProfit: z.number(),
  breakEvenMonth: z.string(),
  maxProfit: z.number(),
  maxLoss: z.number(),
});

const FinancialOptimizationInputSchema = z.object({
  leadCost: z.number().describe('The cost per lead.'),
  recurringCommission: z.number().describe('The recurring commission per sale per month.'),
  newEnrollmentCost: z.number().describe('The one-time cost for each new sale.'),
  leadsPurchasedPerMonth: z.number().describe('The number of leads purchased per month.'),
  newToMarketplacePercentage: z.number().describe('The percentage of purchased leads that convert as new to marketplace.'),
  aorConversionsPerMonth: z.number().describe('The number of agent on record conversions per month.'),
  financialProjection: FinancialProjectionSchema.describe('The current financial projection summary.'),
});
export type FinancialOptimizationInput = z.infer<typeof FinancialOptimizationInputSchema>;

const FinancialOptimizationOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      metric: z.string().describe('The financial metric the recommendation focuses on.'),
      strategy: z.string().describe('The specific strategy to implement.'),
      reasoning: z.string().describe('The reasoning behind the recommendation.'),
      potentialImpact: z.string().describe('The potential impact of implementing the recommendation, can be quantitative or qualitative.'),
    })
  ).describe('A list of recommendations to optimize financial inputs and improve projected outcomes.'),
});
export type FinancialOptimizationOutput = z.infer<typeof FinancialOptimizationOutputSchema>;

export async function getFinancialOptimizationRecommendations(input: FinancialOptimizationInput): Promise<FinancialOptimizationOutput> {
  return financialOptimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialOptimizationPrompt',
  input: {schema: FinancialOptimizationInputSchema},
  output: {schema: FinancialOptimizationOutputSchema},
  prompt: `Given the following financial inputs and current financial projection, provide AI-driven recommendations on how to adjust the financial inputs to optimize the projected revenue and profitability. Provide reasoning for each recommendation.

Financial Inputs:
- Lead Cost: {{{leadCost}}}
- Recurring Commission: {{{recurringCommission}}}
- New Enrollment Cost: {{{newEnrollmentCost}}}
- Leads Purchased Per Month: {{{leadsPurchasedPerMonth}}}
- New to Marketplace Percentage: {{{newToMarketplacePercentage}}}
- AOR Conversions Per Month: {{{aorConversionsPerMonth}}}

Current Financial Projection:
{{{financialProjection}}}

Provide a list of recommendations with the financial metric, strategy, reasoning, and potential impact.
`, 
});

const financialOptimizationFlow = ai.defineFlow(
  {
    name: 'financialOptimizationFlow',
    inputSchema: FinancialOptimizationInputSchema,
    outputSchema: FinancialOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
