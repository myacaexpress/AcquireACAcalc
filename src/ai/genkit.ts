import 'dotenv/config'; // To load .env variables
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import { indexKnowledgeBase } from './knowledgeIndexer'; // Import the indexer - No longer needed

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// Index the knowledge base on startup - No longer needed
// indexKnowledgeBase().then(() => {
//   console.log('Knowledge base indexing initiated.');
// }).catch(err => {
//   console.error('Failed to initiate knowledge base indexing:', err);
// });
