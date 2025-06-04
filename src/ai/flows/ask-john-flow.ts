
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
    // The Google Doc now contains info on carrier bonuses, so web search for that might be less prioritized by the LLM.
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
      // Basic HTML to text conversion: remove tags and excessive whitespace
      let textContent = htmlContent.replace(/<style[^>]*>.*<\/style>/gs, ''); // Remove style blocks
      textContent = textContent.replace(/<[^>]*>/g, ' '); // Remove all HTML tags
      textContent = textContent.replace(/\s+/g, ' ').trim(); // Normalize whitespace

      const lowerSearchQuery = searchQuery.toLowerCase();
      
      // Attempt to find a "paragraph" containing the search query.
      // Google Docs published HTML often wraps paragraphs in <p> tags, but after stripping,
      // we might rely on sentence structure or look for text around the query.
      // A simple approach: find the query and return a snippet around it.
      const queryIndex = textContent.toLowerCase().indexOf(lowerSearchQuery);

      if (queryIndex !== -1) {
        const snippetRadius = 250; // Characters before and after
        const startIndex = Math.max(0, queryIndex - snippetRadius);
        const endIndex = Math.min(textContent.length, queryIndex + lowerSearchQuery.length + snippetRadius);
        
        let snippet = textContent.substring(startIndex, endIndex);

        // Try to make snippet start and end at word boundaries
        if (startIndex > 0) {
            const firstSpace = snippet.indexOf(' ');
            if (firstSpace > -1 && firstSpace < snippetRadius) snippet = snippet.substring(firstSpace + 1);
        }
        if (endIndex < textContent.length) {
            const lastSpace = snippet.lastIndexOf(' ');
            if (lastSpace > -1 && lastSpace > snippet.length - snippetRadius) snippet = snippet.substring(0, lastSpace);
        }
        
        return { results: `Found in document: "...${snippet}..."` };
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
  input: {schema: AskJohnInputSchema},
  output: {schema: AskJohnOutputSchema},
  tools: [searchWebTool, searchGoogleDocTool],
  prompt: `You are John, an expert insurance assistant. Your goal is to provide accurate and helpful answers.
Use the available tools (searchWeb, searchGoogleDoc) to find relevant information if the user's query requires it.
**Prioritize information from searchGoogleDoc for topics like 'SEP', 'Open Enrollment', 'Carrier Bonuses', or other company policies and procedures.**
Use searchWeb for current events, or general knowledge not found in the Google document.
If you use a tool, briefly mention the source of your information in your answer (e.g., "According to our documents..." or "Based on a web search..."). If a tool returns an error or no results, state that you couldn't find the specific information using that tool.
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
      const toolResults = llmResponse.choices[0]?.message.toolResponses;

      if (toolCalls && toolCalls.length > 0) {
         let toolSummary = "I tried using my tools: ";
         toolCalls.forEach((call, index) => {
             toolSummary += `Called ${call.name}. `;
             if(toolResults && toolResults[index]) {
                 toolSummary += `Result: ${JSON.stringify(toolResults[index].response?.output?.results)}. `;
             }
         });
         return { answer: `${toolSummary} However, I couldn't form a final answer based on that. Could you try rephrasing or asking something else?` };
      }
      return { answer: "I'm having a bit of trouble finding that information right now. Please try asking differently or check back later." };
    }
    return output;
  }
);
