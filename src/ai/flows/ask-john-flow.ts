
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
import { retrieveRelevantContext } from '../knowledgeIndexer'; // Import RAG context retrieval

// Schema for the flow's public input and the exported AskJohnInput type
const AskJohnInputSchema = z.object({
  query: z.string().describe("The user's current question for John."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })).optional().describe('The history of the conversation leading up to the current query.'),
});
export type AskJohnInput = z.infer<typeof AskJohnInputSchema>;

// Internal schema for the prompt, including derived boolean flags for Handlebars
const AskJohnPromptInputSchema = z.object({
  query: z.string(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
    isUser: z.boolean(),
    isModel: z.boolean(),
  })).optional(),
  retrievedContext: z.string().optional(), // Add for context from knowledge base
});

const AskJohnOutputSchema = z.object({
  answer: z.string().describe("John's answer to the query."),
});
export type AskJohnOutput = z.infer<typeof AskJohnOutputSchema>;

// Define Tools
const searchWebTool = ai.defineTool(
  {
    name: 'searchWeb',
    description: 'Searches the web for current information, like specific dates or events, or general knowledge not typically found in internal documents. Use this for very recent news or broad topics.',
    inputSchema: z.object({ searchQuery: z.string().describe('A concise query for web search.') }),
    outputSchema: z.object({ results: z.string().describe('A summary of web search results.') }),
  },
  async ({ searchQuery }) => {
    console.log(`[AskJohnFlow] Tool: searchWeb called with query: "${searchQuery}"`);
    // In a real app, this would call a search engine API and process results.
    // For prototype, simulate some results based on query.
    if (searchQuery.toLowerCase().includes('weather')) {
        return { results: `Simulated web search: The weather today is sunny.` };
    }
    return { results: `Simulated web search for "${searchQuery}". No specific information found in this simulation for other queries.` };
  }
);

// The searchGoogleDocTool is now replaced by the RAG system using knowledge_base.md
// We can remove its definition and GOOGLE_DOC_URL.

export async function askJohn(input: AskJohnInput): Promise<AskJohnOutput> {
  return askJohnFlow(input);
}

const askJohnPrompt = ai.definePrompt({
  name: 'askJohnPrompt',
  input: {schema: AskJohnPromptInputSchema}, // Will add retrievedContext here
  output: {schema: AskJohnOutputSchema},
  tools: [searchWebTool], // Removed searchGoogleDocTool
  prompt: `You are John, an expert insurance assistant specializing in ACA health insurance. Your task is to directly answer the user's query.
Base your answers on the provided context from our knowledge base if relevant.
If the query requires current events or general knowledge not covered by the provided context, use the 'searchWeb' tool.

**CRITICALLY IMPORTANT: Your response in the 'answer' field MUST BE the direct answer to the user's query. If context from the knowledge base is provided, synthesize that information into your answer. DO NOT talk about using a tool or your intention to search, unless you are using the 'searchWeb' tool.**

For example, if the user asks "What is consent language?" and the knowledge base context is "Consent language is the specific phrasing used...", your 'answer' should be "Consent language is the specific phrasing used...".
DO NOT say "I found in the knowledge base that consent language is...".

If a tool was used and returned information, synthesize that information into a direct, helpful answer.
If the provided context or web search does not yield an answer, then state that you couldn't find the specific information. For example: "I couldn't find specific details about that in our resources."
Keep your answers concise and directly address the user's question.

{{#if chatHistory.length}}
Previous conversation:
{{#each chatHistory}}
{{#if isUser}}User: {{parts.[0].text}}{{/if}}
{{#if isModel}}John: {{parts.[0].text}}{{/if}}
{{/each}}
{{/if}}

{{#if retrievedContext}}
Context from our knowledge base:
---
{{retrievedContext}}
---
{{/if}}

Current user query: {{{query}}}

Populate the 'answer' field with your direct response based on the query, the provided knowledge base context, and any information retrieved from your tools, following the instructions above.
`,
});

const askJohnFlow = ai.defineFlow(
  {
    name: 'askJohnFlow',
    inputSchema: AskJohnInputSchema,
    outputSchema: AskJohnOutputSchema,
  },
  async (input: AskJohnInput) => {
    const contextChunks = await retrieveRelevantContext(input.query);
    const retrievedContext = contextChunks.join('\n\n---\n\n'); // Join chunks for the prompt

    console.log(`[AskJohnFlow] Retrieved context for query "${input.query}":\n${retrievedContext.substring(0, 500)}...`);

    const promptInput = {
      query: input.query,
      chatHistory: input.chatHistory?.map(msg => ({
        ...msg,
        isUser: msg.role === 'user',
        isModel: msg.role === 'model',
      })),
      retrievedContext: retrievedContext.length > 0 ? retrievedContext : undefined,
    };

    const llmResponse = await askJohnPrompt(promptInput);
    // llmResponse is the direct result of ai.generate(), which includes:
    // - output: The structured output if generation was successful and matched schema.
    // - choices: Raw LLM choices, potentially including tool calls/responses from intermediate steps.
    
    const finalOutput = llmResponse.output;

    if (!finalOutput || !finalOutput.answer || finalOutput.answer.trim() === "") {
      console.error(
        "[AskJohnFlow] LLM did not produce a valid 'answer' in the output schema, or the answer was empty. Full LLM response object:",
        JSON.stringify(llmResponse, null, 2) 
      );
      // Attempt to find an answer in the choices if the structured output is empty
      let fallbackAnswer: string | undefined;

      if (typeof (llmResponse as any)?.raw === 'function') {
        const rawResponseData = (llmResponse as any).raw() as { choices?: Array<{ message?: { role: string; parts: Array<{ text?: string }> } }> } | undefined;

        if (rawResponseData && Array.isArray(rawResponseData.choices)) {
          const modelChoices = rawResponseData.choices.filter(
            (c) => c.message?.role === 'model' && c.message.parts.some(p => typeof p.text === 'string' && p.text.trim() !== '')
          );
          
          if (modelChoices.length > 0) {
            const lastModelMessageParts = modelChoices[modelChoices.length - 1].message?.parts;
            if (lastModelMessageParts && lastModelMessageParts.length > 0 && typeof lastModelMessageParts[0].text === 'string') {
              fallbackAnswer = lastModelMessageParts[0].text;
            }
          }
        }
      } else {
        console.warn("[AskJohnFlow] llmResponse.raw() is not a function or llmResponse is not as expected.");
      }
      
      if (fallbackAnswer) {
        console.log("[AskJohnFlow] Using text from last model choice as fallback answer.");
        return { answer: fallbackAnswer };
      }

      return { answer: "I'm having a bit of trouble finding that information right now. Could you try rephrasing or asking something else?" };
    }
    return finalOutput;
  }
);
