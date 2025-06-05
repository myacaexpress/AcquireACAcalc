import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { indexKnowledgeBase } from './knowledgeIndexer'; // Import the indexer

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// Index the knowledge base on startup
indexKnowledgeBase().then(() => {
  console.log('Knowledge base indexing initiated.');
}).catch(err => {
  console.error('Failed to initiate knowledge base indexing:', err);
});
