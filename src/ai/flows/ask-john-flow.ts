
'use server';
/**
 * @fileOverview Provides AI-driven answers for the "Ask John" chat interface.
 *
 * - askJohn - A function that handles user queries.
 * - AskJohnInput - The input type for the askJohn function.
 * - AskJohnOutput - The return type for the askJohn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskJohnInputSchema = z.object({
  query: z.string().describe("The user's current question for John."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })).optional().describe('The history of the conversation leading up to the current query.'),
});
export type AskJohnInput = z.infer<typeof AskJohnInputSchema>;

const AskJohnOutputSchema = z.object({
  answer: z.string().describe("John's answer to the query."),
});
export type AskJohnOutput = z.infer<typeof AskJohnOutputSchema>;

// Define Tools (Simplified for prototype)
const searchWebTool = ai.defineTool(
  {
    name: 'searchWeb',
    description: 'Searches the web for current information, like bonuses, specific dates or events, or general knowledge.',
    inputSchema: z.object({ searchQuery: z.string().describe('A concise query for web search.') }),
    outputSchema: z.object({ results: z.string().describe('A summary of web search results.') }),
  },
  async ({ searchQuery }) => {
    console.log(`[AskJohnFlow] Tool: searchWeb called with query: "${searchQuery}"`);
    // In a real app, this would call a search engine API and process results.
    // For prototype, simulate some results based on query.
    if (searchQuery.toLowerCase().includes('carrier bonuses')) {
        return { results: `Simulated web search: Current carrier bonuses for 2024 include an extra $100 for Plan X and double points for Plan Y referrals.` };
    }
    return { results: `Simulated web search results for "${searchQuery}". No specific information found in this simulation for other queries.` };
  }
);

const searchGoogleDocTool = ai.defineTool(
  {
    name: 'searchGoogleDoc',
    description: "Searches an internal Google Document containing company policies, definitions like 'SEP', and enrollment procedures.",
    inputSchema: z.object({ searchQuery: z.string().describe('A query to search within the Google Doc.') }),
    outputSchema: z.object({ results: z.string().describe('Relevant snippets or summary from the Google Doc.') }),
  },
  async ({ searchQuery }) => {
    console.log(`[AskJohnFlow] Tool: searchGoogleDoc called with query: "${searchQuery}"`);
    // In a real app, this would integrate with Google Drive API
    if (searchQuery.toLowerCase().includes('sep')) {
        return { results: `Simulated Google Doc search: SEP stands for Special Enrollment Period. It allows enrollment outside Open Enrollment due to qualifying life events.` };
    }
    if (searchQuery.toLowerCase().includes('open enrollment')) {
        return { results: `Simulated Google Doc search: Generally, you need to wait for Open Enrollment unless you have a Special Enrollment Period (SEP) qualifying event.` };
    }
    return { results: `Simulated Google Doc search for "${searchQuery}". No specific information found in this simulation for other queries.` };
  }
);

export async function askJohn(input: AskJohnInput): Promise<AskJohnOutput> {
  return askJohnFlow(input);
}

const askJohnPrompt = ai.definePrompt({
  name: 'askJohnPrompt',
  input: {schema: AskJohnInputSchema},
  output: {schema: AskJohnOutputSchema},
  tools: [searchWebTool, searchGoogleDocTool],
  prompt: `You are John, an expert insurance assistant. Your goal is to provide accurate and helpful answers.
Use the available tools (searchWeb, searchGoogleDoc) to find relevant information if the user's query requires it.
Prioritize information from searchGoogleDoc for internal policies, definitions, and procedures. Use searchWeb for current events, bonuses, or general knowledge not found in documents.
If you use a tool, briefly mention the source of your information in your answer (e.g., "According to our documents..." or "Based on a web search...").
Keep your answers concise and directly address the query.

{{#if chatHistory.length}}
Previous conversation:
{{#each chatHistory}}
{{#if (eq role "user")}}User: {{parts.[0].text}}{{/if}}
{{#if (eq role "model")}}John: {{parts.[0].text}}{{/if}}
{{/each}}
{{/if}}

Current user query: {{{query}}}

Provide your answer for the 'answer' field.
`,
});

const askJohnFlow = ai.defineFlow(
  {
    name: 'askJohnFlow',
    inputSchema: AskJohnInputSchema,
    outputSchema: AskJohnOutputSchema,
  },
  async (input: AskJohnInput) => {
    const llmResponse = await askJohnPrompt(input);
    const { output } = llmResponse;

    if (!output || !output.answer) {
      console.error("AskJohnFlow: LLM did not produce the expected output structure or answer was empty.", llmResponse);
      // Check if there were tool calls that might explain missing direct answer
      const toolCalls = llmResponse.choices[0]?.message.toolCalls;
      if (toolCalls && toolCalls.length > 0) {
        return { answer: "I tried to use my tools but couldn't form a final answer. Could you try rephrasing?" };
      }
      return { answer: "I'm having a bit of trouble finding that information right now. Please try asking differently or check back later." };
    }
    return output;
  }
);
