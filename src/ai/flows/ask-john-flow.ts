
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

const GOOGLE_DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vTbS1jumfLRGI0p7A-ARCXRah23Y5vsNlpzdEEmP6aAs4wA2IH1s-DDRNvWDabh-cuOgX57OhmlZRst/pub";

const searchGoogleDocTool = ai.defineTool(
  {
    name: 'searchGoogleDoc',
    description: "Searches an internal Google Document containing company policies, definitions like 'SEP', 'Open Enrollment', 'Carrier Bonuses', and 'consent language'. Use this as the primary source for such topics.",
    inputSchema: z.object({ searchQuery: z.string().describe('A query to search within the Google Doc.') }),
    outputSchema: z.object({ results: z.string().describe('Relevant snippets or summary from the Google Doc.') }),
  },
  async ({ searchQuery }) => {
    console.log(`[AskJohnFlow] Tool: searchGoogleDoc called with query: "${searchQuery}"`);
    try {
      const response = await fetch(GOOGLE_DOC_URL);
      if (!response.ok) {
        console.error(`[AskJohnFlow] Error fetching Google Doc: ${response.status} ${response.statusText}`);
        return { results: `Error: Could not fetch the document (status: ${response.status}).` };
      }
      const htmlContent = await response.text();
      let textContent = htmlContent.replace(/<style[^>]*>.*<\/style>/gs, '');
      textContent = textContent.replace(/<[^>]*>/g, ' ');
      textContent = textContent.replace(/\s+/g, ' ').trim();

      const lowerSearchQuery = searchQuery.toLowerCase();
      const queryIndex = textContent.toLowerCase().indexOf(lowerSearchQuery);

      if (queryIndex !== -1) {
        const snippetRadius = 250; // Characters around the query
        let windowStart = Math.max(0, queryIndex - snippetRadius);
        let windowEnd = Math.min(textContent.length, queryIndex + lowerSearchQuery.length + snippetRadius);
        
        let snippet = textContent.substring(windowStart, windowEnd);

        // Try to adjust start to a word boundary
        if (windowStart > 0) {
            const lastSpace = snippet.substring(0, queryIndex - windowStart).lastIndexOf(' ');
            if (lastSpace !== -1 && (queryIndex - windowStart) - lastSpace < snippetRadius / 2) { // Only trim if space is reasonably close
                 snippet = snippet.substring(lastSpace + 1);
            }
        }
        // Try to adjust end to a word boundary
        const currentMatchStartIndex = snippet.toLowerCase().indexOf(lowerSearchQuery); // Re-evaluate index in potentially trimmed snippet
        if (currentMatchStartIndex !== -1 && windowEnd < textContent.length) {
            const matchEndIndexInSnippet = currentMatchStartIndex + lowerSearchQuery.length;
            const firstSpace = snippet.substring(matchEndIndexInSnippet).indexOf(' ');
            if (firstSpace !== -1 && firstSpace < snippetRadius / 2) { // Only trim if space is reasonably close
                snippet = snippet.substring(0, matchEndIndexInSnippet + firstSpace);
            }
        }
        
        // Ensure the query is still in the snippet, otherwise fallback to simpler extraction
        if (snippet.toLowerCase().indexOf(lowerSearchQuery) === -1) {
            const fallbackStart = Math.max(0, queryIndex - 75);
            const fallbackEnd = Math.min(textContent.length, queryIndex + lowerSearchQuery.length + 75);
            snippet = textContent.substring(fallbackStart, fallbackEnd);
        }
        
        const prefixEllipsis = windowStart > 0 && !snippet.startsWith(textContent.substring(0,10)) ? "..." : "";
        const suffixEllipsis = windowEnd < textContent.length && !snippet.endsWith(textContent.substring(textContent.length -10)) ? "..." : "";

        return { results: `Found in document: ${prefixEllipsis}${snippet}${suffixEllipsis}` };
      } else {
        return { results: `The query "${searchQuery}" was not found in the document.` };
      }

    } catch (error) {
      console.error(`[AskJohnFlow] Exception in searchGoogleDocTool:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { results: `Error: Could not process the document search. Details: ${errorMessage}` };
    }
  }
);

export async function askJohn(input: AskJohnInput): Promise<AskJohnOutput> {
  return askJohnFlow(input);
}

const askJohnPrompt = ai.definePrompt({
  name: 'askJohnPrompt',
  input: {schema: AskJohnPromptInputSchema},
  output: {schema: AskJohnOutputSchema},
  tools: [searchWebTool, searchGoogleDocTool],
  prompt: `You are John, an expert insurance assistant. Your task is to answer the user's query.
If the query requires information about 'SEP', 'Open Enrollment', 'Carrier Bonuses', 'consent language', or company policies, you MUST use the 'searchGoogleDoc' tool.
If the query requires current events or general knowledge, use the 'searchWeb' tool.

**IMPORTANT: After a tool is used and returns its results, you MUST use those results to construct the text for the 'answer' field. The 'answer' field should contain the actual information found or a summary, not a statement about your intention to search.**

If a tool was used, briefly mention its source in the 'answer' field (e.g., "According to our documents..." or "Based on a web search...").
If a tool returns an error or no relevant results, state that you couldn't find the specific information using that tool in the 'answer' field.
Keep your answers concise.

{{#if chatHistory.length}}
Previous conversation:
{{#each chatHistory}}
{{#if isUser}}User: {{parts.[0].text}}{{/if}}
{{#if isModel}}John: {{parts.[0].text}}{{/if}}
{{/each}}
{{/if}}

Current user query: {{{query}}}

Populate the 'answer' field with your response based on the query and any information retrieved from your tools.
`,
});

const askJohnFlow = ai.defineFlow(
  {
    name: 'askJohnFlow',
    inputSchema: AskJohnInputSchema,
    outputSchema: AskJohnOutputSchema,
  },
  async (input: AskJohnInput) => {
    const promptInput = {
      query: input.query,
      chatHistory: input.chatHistory?.map(msg => ({
        ...msg,
        isUser: msg.role === 'user',
        isModel: msg.role === 'model',
      })),
    };

    const llmResponse = await askJohnPrompt(promptInput);
    // llmResponse is the direct result of ai.generate(), which includes:
    // - output: The structured output if generation was successful and matched schema.
    // - choices: Raw LLM choices, potentially including tool calls/responses from intermediate steps.
    
    const finalOutput = llmResponse.output;

    if (!finalOutput || !finalOutput.answer || finalOutput.answer.trim() === "") {
      console.error(
        "AskJohnFlow: LLM did not produce a valid 'answer' in the output schema, or the answer was empty. Full response:",
        JSON.stringify(llmResponse, null, 2) // Log the entire response for debugging
      );
      return { answer: "I'm having a bit of trouble finding that information right now. Could you try rephrasing or asking something else?" };
    }
    return finalOutput;
  }
);

    