
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
    console.log(`[AskJohnFlow] Tool: searchWeb (Perplexity API) called with query: "${searchQuery}"`);
    
    // IMPORTANT: Replace with your actual Perplexity API key and correct endpoint if different.
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY || "YOUR_PERPLEXITY_API_KEY_HERE"; 
    const perplexityApiUrl = "https://api.perplexity.ai/chat/completions"; // This is a common pattern for chat/search APIs, adjust if needed.

    if (perplexityApiKey === "YOUR_PERPLEXITY_API_KEY_HERE") {
      console.warn("[AskJohnFlow] Perplexity API key not set. searchWebTool will return a placeholder message.");
      return { results: `Web search for "${searchQuery}" requires a Perplexity API key to be configured.`};
    }

    try {
      // This is a hypothetical request structure for Perplexity API.
      // You'll need to consult the actual Perplexity API documentation for the correct request body and headers.
      const requestBody = {
        model: "pplx-7b-online", // Or other appropriate online model
        messages: [
          { role: "system", content: "You are a helpful AI assistant. Provide concise and relevant search results." },
          { role: "user", content: searchQuery }
        ],
        max_tokens: 300, // Added max_tokens
      };

      const response = await fetch(perplexityApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[AskJohnFlow] Perplexity API request failed with status ${response.status}: ${errorBody}`);
        return { results: `Error performing web search: Perplexity API returned ${response.status}.` };
      }

      const perplexityResult = await response.json();
      
      // Adapt based on the actual structure of the Perplexity API response.
      // This example assumes a chat completions like structure.
      let resultText = '';
      // Check for explicit error structure first
      if (perplexityResult.error) {
        console.error(`[AskJohnFlow] Perplexity API returned an error: ${JSON.stringify(perplexityResult.error)}`);
        resultText = `Error from Perplexity API: ${perplexityResult.error.message || JSON.stringify(perplexityResult.error)}`;
      } else if (perplexityResult.choices && perplexityResult.choices.length > 0 && perplexityResult.choices[0].message && perplexityResult.choices[0].message.content) {
        resultText = perplexityResult.choices[0].message.content;
      } else {
        // Fallback for other unexpected structures
        const unexpectedResponse = JSON.stringify(perplexityResult);
        console.warn(`[AskJohnFlow] Perplexity API returned an unexpected structure: ${unexpectedResponse.substring(0, 200)}...`);
        resultText = `Web search returned an unexpected data structure.`;
      }
      
      console.log(`[AskJohnFlow] Perplexity API search result (or error): ${resultText.substring(0, 200)}...`);
      return { results: resultText };

    } catch (error) {
      let errorMessage = `Error performing web search for "${searchQuery}". Could not connect to Perplexity API.`;
      if (error instanceof Error) {
        errorMessage = `Error during web search for "${searchQuery}": ${error.message}`;
        console.error(`[AskJohnFlow] Fetch Error for Perplexity API: ${error.name} - ${error.message}${error.stack ? `\nStack: ${error.stack}`: ''}`);
      } else {
        console.error(`[AskJohnFlow] Unknown Fetch Error for Perplexity API:`, error);
      }
      return { results: errorMessage };
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
  tools: [searchWebTool],
  prompt: `You are John, an expert insurance assistant specializing in ACA health insurance.

Your task is to directly answer the user's query.
Follow these steps:
1.  **Analyze the Query:** Determine if the user's query is related to ACA health insurance or if it's a general knowledge/current events query (e.g., weather, news).

2.  **General Knowledge/Web Search:**
    *   If the query is clearly about a topic NOT typically covered by your specialized ACA insurance knowledge (e.g., "what is the weather today?", "latest sports scores", "what is the FPL requirement in Texas for 2024", general news, specific factual data not related to ACA plan details you'd already know), you MUST use the 'searchWeb' tool directly to find the answer without asking for confirmation.
    *   If the query IS about ACA health insurance advice or complex plan comparisons that might benefit from your core knowledge first, try to answer from your general training. If you cannot provide a complete answer or if current factual data (like specific FPL numbers for a given year if not already known) is needed, you SHOULD use the 'searchWeb' tool directly to find the missing information without asking for confirmation.
    *   When using the 'searchWeb' tool, synthesize the search results into a direct, helpful answer.

3.  **Final Answer Formulation:**
    *   Your response in the 'answer' field MUST BE the direct answer to the user's query.
    *   When you use the 'searchWeb' tool as instructed above, directly provide the answer based on the search results. Do not state your intention to search or ask for confirmation before searching for these types of queries.
    *   If, after attempting to answer from your general knowledge AND performing a web search (if appropriate), you still cannot find the specific information, THEN and ONLY THEN should you state something like: "I couldn't find specific details about that, even after a web search." or "I searched for that information but couldn't find a definitive answer."
    *   If, after attempting to answer from your general knowledge AND performing a web search (if appropriate and confirmed), you still cannot find the specific information, THEN and ONLY THEN should you state something like: "I couldn't find specific details about that, even after a web search." or "I searched for that information but couldn't find a definitive answer."

Keep your answers concise and directly address the user's question.

{{#if chatHistory.length}}
Previous conversation:
{{#each chatHistory}}
{{#if isUser}}User: {{parts.[0].text}}{{/if}}
{{#if isModel}}John: {{parts.[0].text}}{{/if}}
{{/each}}
{{/if}}

Current user query: {{{query}}}

Populate the 'answer' field with your direct response based on the query and any information retrieved from your tools, following the instructions above.
`
});

const askJohnFlow = ai.defineFlow(
  {
    name: 'askJohnFlow',
    inputSchema: AskJohnInputSchema,
    outputSchema: AskJohnOutputSchema,
  },
  async (input: AskJohnInput): Promise<AskJohnOutput> => {
    console.log("[AskJohnFlow] Entered function with query:", input.query);
    try {
      console.log("[AskJohnFlow] Preparing promptInput.");
      const promptInput = {
        query: input.query,
        chatHistory: input.chatHistory?.map(msg => ({
          ...msg,
          isUser: msg.role === 'user',
          isModel: msg.role === 'model',
        })),
      };
      console.log("[AskJohnFlow] promptInput prepared. Query:", promptInput.query);

      let llmResponse;
      try {
        console.log("[AskJohnFlow] Calling askJohnPrompt...");
        llmResponse = await askJohnPrompt(promptInput);
        console.log("[AskJohnFlow] askJohnPrompt call completed.");
      } catch (promptError) {
        console.error("[AskJohnFlow] Error directly from askJohnPrompt() call.");
        if (promptError instanceof Error) {
          console.error(`[AskJohnFlow] PromptError Name: ${promptError.name}`);
          console.error(`[AskJohnFlow] PromptError Message: ${promptError.message}`);
          if (promptError.stack) {
            console.error(`[AskJohnFlow] PromptError Stack: ${promptError.stack}`);
          }
        } else {
          console.error("[AskJohnFlow] PromptError (raw, non-Error object):", String(promptError));
          try {
            const serializedError = JSON.stringify(promptError);
            console.error("[AskJohnFlow] Serialized PromptError (non-Error object):", serializedError);
          } catch (e) {
            console.error("[AskJohnFlow] Could not serialize non-Error promptError:", String(promptError));
          }
        }
        return { answer: "There was an issue communicating with the AI model. Please try again shortly." };
      }
      
      console.log("[AskJohnFlow] Processing llmResponse.");
      const finalOutput = llmResponse?.output; 

      if (!finalOutput || typeof finalOutput.answer !== 'string' || finalOutput.answer.trim() === "") {
        console.warn("[AskJohnFlow] LLM output was invalid or answer was empty. Attempting fallback.");
        let llmResponseString = 'llmResponse is undefined or null.';
        if (llmResponse !== undefined && llmResponse !== null) {
          try {
            llmResponseString = JSON.stringify(llmResponse, null, 2);
          } catch (e) {
            llmResponseString = "Could not stringify llmResponse. " + String(llmResponse);
            console.error("[AskJohnFlow] Error stringifying llmResponse for logging:", e);
          }
        }
        
        let finalOutputString = 'finalOutput is undefined, null, or not an object.';
        if (finalOutput !== undefined && finalOutput !== null) {
           try {
            finalOutputString = JSON.stringify(finalOutput);
          } catch (e) {
            finalOutputString = "Could not stringify finalOutput. " + String(finalOutput);
          }
        }
        
        console.error(
          `[AskJohnFlow] LLM did not produce a valid 'answer' in the output schema, or the answer was empty. finalOutput: ${finalOutputString}. Full llmResponse object: ${llmResponseString}`
        );
        
        let fallbackAnswer: string | undefined;
        if (llmResponse && typeof (llmResponse as any).raw === 'function') {
          try {
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
          } catch (rawError) {
            console.error("[AskJohnFlow] Error processing llmResponse.raw():", rawError);
          }
        } else {
          console.warn("[AskJohnFlow] llmResponse.raw() is not a function or llmResponse is undefined/null.");
        }
        
        if (fallbackAnswer) {
          console.log("[AskJohnFlow] Using text from last model choice as fallback answer.");
          return { answer: fallbackAnswer };
        }

        return { answer: "I'm having a bit of trouble processing that request. Please try rephrasing or asking something else." };
      }
      return finalOutput;

    } catch (flowError) {
      console.error("[AskJohnFlow] Unhandled error in flow execution (outer catch).");
      if (flowError instanceof Error) {
        console.error(`[AskJohnFlow] FlowError Name: ${flowError.name}`);
        console.error(`[AskJohnFlow] FlowError Message: ${flowError.message}`);
        if (flowError.stack) {
          console.error(`[AskJohnFlow] FlowError Stack: ${flowError.stack}`);
        }
      } else {
        console.error("[AskJohnFlow] FlowError (raw, non-Error object):", String(flowError));
        try {
          const serializedFlowError = JSON.stringify(flowError);
          console.error("[AskJohnFlow] Serialized FlowError (non-Error object):", serializedFlowError);
        } catch (e) {
          console.error("[AskJohnFlow] Could not serialize non-Error flowError:", String(flowError));
        }
      }
      return { answer: "An unexpected error occurred while processing your request. Please try again." };
    }
  }
);
