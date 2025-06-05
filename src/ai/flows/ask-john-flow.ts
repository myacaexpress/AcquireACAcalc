
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
    outputSchema: z.object({ results: z.string().describe('Relevant text content from the Google Doc.') }),
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
      console.log('[AskJohnFlow] Fetched HTML from Google Doc (first 500 chars):', htmlContent.substring(0,500));

      // Step 1: Replace block-level closing tags and <br> with newlines
      let textContent = htmlContent
        .replace(/<\/(p|div|h[1-6]|li|tr|th|td)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n');

      // Step 2: Strip all other HTML tags
      textContent = textContent.replace(/<[^>]*>/g, ' ');

      // Step 3: Normalize whitespace
      textContent = textContent.replace(/[ \t]+/g, ' ').trim(); // Consolidate spaces and tabs
      textContent = textContent.replace(/\n\s*\n+/g, '\n').trim(); // Consolidate multiple newlines and trim whitespace around them

      console.log('[AskJohnFlow] Processed textContent (first 500 chars):', textContent.substring(0,500));
      
      const lowerSearchQuery = searchQuery.toLowerCase();
      let queryIndex = -1;
      // Use a regex to find the match, preserving original casing for context later
      const searchRegex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const match = textContent.match(searchRegex);

      if (match && typeof match.index === 'number') {
        queryIndex = match.index;
        const matchedTermInDocument = match[0]; // The actual term found, with its original casing
        console.log(`[AskJohnFlow] Found query "${searchQuery}" as "${matchedTermInDocument}" at index ${queryIndex}`);

        // Find the start of the "paragraph" (previous \n or start of doc)
        let paraStart = textContent.lastIndexOf('\n', queryIndex - 1);
        paraStart = paraStart === -1 ? 0 : paraStart + 1; // adjust to char after \n

        // Find the end of the "paragraph" (next \n or end of doc)
        let paraEnd = textContent.indexOf('\n', queryIndex + matchedTermInDocument.length);
        paraEnd = paraEnd === -1 ? textContent.length : paraEnd;
        
        let paragraph = textContent.substring(paraStart, paraEnd).trim();
        console.log(`[AskJohnFlow] Initial extracted paragraph (length ${paragraph.length}): "${paragraph.substring(0, 200)}..."`);


        const MAX_PARA_LENGTH = 1200; 
        const SNIPPET_RADIUS = 400; 

        if (paragraph.length > MAX_PARA_LENGTH) {
            console.log(`[AskJohnFlow] Paragraph is too long (${paragraph.length} chars), creating snippet.`);
            // Calculate snippet start and end relative to the full textContent
            // to ensure we are centered around the original queryIndex
            let snippetStartFullText = Math.max(0, queryIndex - SNIPPET_RADIUS);
            let snippetEndFullText = Math.min(textContent.length, queryIndex + matchedTermInDocument.length + SNIPPET_RADIUS);
            
            paragraph = textContent.substring(snippetStartFullText, snippetEndFullText).trim();
            
            if (snippetStartFullText > 0 && !paragraph.startsWith(textContent.substring(0,10))) {
                 paragraph = "..." + paragraph;
            }
            if (snippetEndFullText < textContent.length && !paragraph.endsWith(textContent.substring(textContent.length-10))) {
                paragraph = paragraph + "...";
            }
            console.log(`[AskJohnFlow] Generated snippet: "${paragraph.substring(0,200)}..."`);
        }
        
        if (paragraph && paragraph.toLowerCase().includes(lowerSearchQuery)) {
          console.log(`[AskJohnFlow] Returning paragraph/snippet for LLM: "${paragraph}"`);
          return { results: paragraph };
        } else {
          console.warn(`[AskJohnFlow] Extracted paragraph/snippet no longer contains query "${lowerSearchQuery}". Fallback used.`);
          // Fallback if paragraph extraction failed to capture the query or paragraph is empty
           const fallbackSnippetStart = Math.max(0, queryIndex - 150);
           const fallbackSnippetEnd = Math.min(textContent.length, queryIndex + matchedTermInDocument.length + 150);
           let fallbackSnippet = textContent.substring(fallbackSnippetStart, fallbackSnippetEnd).trim();
           if (fallbackSnippetStart > 0) fallbackSnippet = "..." + fallbackSnippet;
           if (fallbackSnippetEnd < textContent.length) fallbackSnippet = fallbackSnippet + "...";
           const resultText = fallbackSnippet || `Could not extract a relevant snippet for "${searchQuery}".`;
           console.log(`[AskJohnFlow] Returning fallback snippet for LLM: "${resultText}"`);
           return { results: resultText };
        }
      } else {
        console.log(`[AskJohnFlow] Query "${searchQuery}" not found in document.`);
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
        "[AskJohnFlow] LLM did not produce a valid 'answer' in the output schema, or the answer was empty. Full LLM response object:",
        JSON.stringify(llmResponse, null, 2) 
      );
      // Attempt to find an answer in the choices if the structured output is empty
      // This might happen if the LLM responded but it wasn't in the expected schema
      const lastModelChoice = llmResponse.choices
        .filter(c => c.message.role === 'model' && c.message.parts.some(p => p.text && p.text.trim() !== ''))
        .pop();
      
      if (lastModelChoice && lastModelChoice.message.parts[0].text) {
        console.log("[AskJohnFlow] Using text from last model choice as fallback answer.");
        return { answer: lastModelChoice.message.parts[0].text };
      }

      return { answer: "I'm having a bit of trouble finding that information right now. Could you try rephrasing or asking something else?" };
    }
    return finalOutput;
  }
);
