
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
    description: "Searches an internal Google Document containing company policies, definitions like 'SEP', 'Open Enrollment', and information on 'Carrier Bonuses'. Use this as the primary source for such topics.",
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
        const snippetRadius = 250;
        const windowStart = Math.max(0, queryIndex - snippetRadius);
        const windowEnd = Math.min(textContent.length, queryIndex + lowerSearchQuery.length + snippetRadius);

        let snippet = textContent.substring(windowStart, windowEnd);
        
        // Adjust start of snippet to be on a word boundary from the context before the match
        if (windowStart > 0) { 
          const matchStartIndexInCurrentSnippet = queryIndex - windowStart;
          const prefixPart = snippet.substring(0, matchStartIndexInCurrentSnippet);
          const lastSpaceInPrefix = prefixPart.lastIndexOf(' ');
          if (lastSpaceInPrefix !== -1) {
            snippet = snippet.substring(lastSpaceInPrefix + 1); 
          }
          // If no space, means prefix is one word or empty; keep as is.
        }

        // Adjust end of snippet to be on a word boundary from the context after the match
        // Need to re-calculate match position if snippet start was trimmed
        const currentMatchStartIndex = snippet.toLowerCase().indexOf(lowerSearchQuery);
        if (currentMatchStartIndex !== -1 && windowEnd < textContent.length) {
          const matchEndIndexInCurrentSnippet = currentMatchStartIndex + lowerSearchQuery.length;
          const suffixPart = snippet.substring(matchEndIndexInCurrentSnippet);
          const firstSpaceInSuffix = suffixPart.indexOf(' ');
          if (firstSpaceInSuffix !== -1) {
            snippet = snippet.substring(0, matchEndIndexInCurrentSnippet + firstSpaceInSuffix);
          }
          // If no space, means suffix is one word or empty; keep as is.
        }
        
        let prefixEllipsis = windowStart > 0 ? "..." : "";
        let suffixEllipsis = windowEnd < textContent.length ? "..." : "";
        
        // Fallback if aggressive trimming somehow removed the query
        if (snippet.toLowerCase().indexOf(lowerSearchQuery) === -1) {
            const fallbackStart = Math.max(0, queryIndex - 75); // Shorter radius for fallback
            const fallbackEnd = Math.min(textContent.length, queryIndex + lowerSearchQuery.length + 75);
            snippet = textContent.substring(fallbackStart, fallbackEnd);
            prefixEllipsis = fallbackStart > 0 ? "..." : "";
            suffixEllipsis = fallbackEnd < textContent.length ? "..." : "";
        }

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
  prompt: `You are John, an expert insurance assistant. Your goal is to provide accurate and helpful answers.
Use the available tools (searchWeb, searchGoogleDoc) to find relevant information if the user's query requires it.
**Prioritize information from searchGoogleDoc for topics like 'SEP', 'Open Enrollment', 'Carrier Bonuses', 'consent language', or other company policies and procedures.**
Use searchWeb for current events, or general knowledge not found in the Google document.
If you use a tool, briefly mention the source of your information in your answer (e.g., "According to our documents..." or "Based on a web search..."). If a tool returns an error or no results, state that you couldn't find the specific information using that tool.
Keep your answers concise and directly address the query.

{{#if chatHistory.length}}
Previous conversation:
{{#each chatHistory}}
{{#if isUser}}User: {{parts.[0].text}}{{/if}}
{{#if isModel}}John: {{parts.[0].text}}{{/if}}
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
    const promptInput = {
      query: input.query,
      chatHistory: input.chatHistory?.map(msg => ({
        ...msg,
        isUser: msg.role === 'user',
        isModel: msg.role === 'model',
      })),
    };

    const llmResponse = await askJohnPrompt(promptInput);
    const { output } = llmResponse;

    if (!output || !output.answer) {
      console.error("AskJohnFlow: LLM did not produce the expected output structure or answer was empty.", llmResponse);
      const toolCalls = llmResponse.choices[0]?.message.toolCalls;
      const toolResults = llmResponse.choices[0]?.message.toolResponses;

      if (toolCalls && toolCalls.length > 0) {
         let toolSummary = "I tried using my tools: ";
         toolCalls.forEach((call, index) => {
             toolSummary += `Called ${call.name}. `;
             if(toolResults && toolResults[index] && toolResults[index].response) {
                 const toolCallOutput = toolResults[index].response?.output as { results?: string };
                 toolSummary += `Result: ${toolCallOutput?.results || "no specific result text"}. `;
             } else {
                toolSummary += `No result or error from tool. `;
             }
         });
         return { answer: `${toolSummary} However, I couldn't form a final answer based on that. Could you try rephrasing or asking something else?` };
      }
      return { answer: "I'm having a bit of trouble finding that information right now. Please try asking differently or check back later." };
    }
    return output;
  }
);

