
import { Document, DocumentDataSchema } from 'genkit'; // Corrected imports
import { ai } from '@/ai/genkit'; // Import the configured ai instance
import { z } from 'genkit'; // Import Zod from Genkit
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { MarkdownTextSplitter } from 'langchain/text_splitter';

const KNOWLEDGE_BASE_PATH = resolve(__dirname, 'data', 'knowledge_base.md');
const knowledgeEmbedderId = 'googleai/text-embedding-004';

let indexedDocuments: Document[] = [];

// Variable to store the memoized retriever
let memoizedKnowledgeRetriever: ReturnType<typeof ai.defineRetriever> | null = null;

// Function to define and get the retriever, initializing it only once
function getInitializedKnowledgeRetriever() {
  if (!memoizedKnowledgeRetriever) {
    console.log('[KnowledgeIndexer] Initializing knowledgeBaseRetriever...');
    memoizedKnowledgeRetriever = ai.defineRetriever(
      { name: 'knowledgeBaseRetriever' },
      async (queryDoc: Document): Promise<{ documents: Document[] }> => {
        if (indexedDocuments.length === 0) {
          console.warn('[KnowledgeIndexer] knowledgeBaseRetriever: Knowledge base not indexed yet. Indexing now...');
          await indexKnowledgeBase(); // Attempt to index if called before initial indexing
          if (indexedDocuments.length === 0) {
            console.warn('[KnowledgeIndexer] knowledgeBaseRetriever: Knowledge base still empty after attempting index.');
            return { documents: [] };
          }
        }

        const queryText = queryDoc.content[0]?.text;
        if (!queryText) {
          console.warn('[KnowledgeIndexer] knowledgeBaseRetriever: Query document has no text content.');
          return { documents: [] };
        }
        console.log(`[KnowledgeIndexer] knowledgeBaseRetriever: Searching for query: "${queryText.substring(0,100)}..."`);

        const embeddingResult = await ai.embed({
          embedder: knowledgeEmbedderId,
          content: queryText,
        });
        const queryActualEmbedding = (embeddingResult as any).embedding || embeddingResult;

        if (!queryActualEmbedding || queryActualEmbedding.length === 0) {
            console.warn('[KnowledgeIndexer] knowledgeBaseRetriever: Failed to generate embedding for query.');
            return { documents: [] };
        }

        const scoredDocuments = indexedDocuments
          .map(doc => {
            let score = 0;
            const docEmbedding = (doc as any).embedding as number[] | undefined;

            if (docEmbedding && docEmbedding.length > 0 && queryActualEmbedding && queryActualEmbedding.length > 0 && docEmbedding.length === queryActualEmbedding.length) {
              score = docEmbedding.reduce((sum: number, val: number, i: number) => sum + (val * (queryActualEmbedding[i] as number)), 0);
            } else {
                // console.warn(`[KnowledgeIndexer] Skipping document due to embedding mismatch or missing embedding. Doc ID: ${doc.metadata?.id || 'N/A'}`);
            }
            return { doc, score };
          })
          .filter(item => item.score > 0); // Filter out items with zero or invalid scores if necessary

        scoredDocuments.sort((a, b) => (b.score || 0) - (a.score || 0));
        const topN = 3; // Define how many documents to return
        const finalDocs: Document[] = scoredDocuments.slice(0, topN).map(item => item.doc);
        // console.log(`[KnowledgeIndexer] knowledgeBaseRetriever: Found ${finalDocs.length} relevant documents.`);
        return { documents: finalDocs };
      }
    );
  }
  return memoizedKnowledgeRetriever;
}


/**
 * Indexes the content of the knowledge_base.md file.
 * Reads the file, splits it into chunks, generates embeddings, and stores them.
 */
export async function indexKnowledgeBase() {
  try {
    const markdownContent = await readFile(KNOWLEDGE_BASE_PATH, 'utf-8');

    const splitter = new MarkdownTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    const chunks = await splitter.createDocuments([markdownContent]);

    console.log(`[KnowledgeIndexer] Splitting document into ${chunks.length} chunks.`);

    const documentsToEmbed: Document[] = chunks.map((chunk, index) =>
      Document.fromText(chunk.pageContent, { ...chunk.metadata, id: `chunk-${index}` })
    );

    const tempIndexedDocs: Document[] = [];
    for (const doc of documentsToEmbed) {
        const docText = doc.content[0]?.text;
        if (!docText) continue;

        const embeddingResult = await ai.embed({
            embedder: knowledgeEmbedderId,
            content: docText,
        });
        const actualEmbedding = (embeddingResult as any).embedding || embeddingResult;
        if (actualEmbedding && actualEmbedding.length > 0) {
            (doc as any).embedding = actualEmbedding;
            tempIndexedDocs.push(doc);
        } else {
            console.warn(`[KnowledgeIndexer] Failed to generate embedding for document chunk: ${doc.metadata?.id || 'N/A'}`);
        }
    }
    indexedDocuments = tempIndexedDocs;

    console.log(`[KnowledgeIndexer] Successfully indexed ${indexedDocuments.length} document chunks from knowledge_base.md`);
  } catch (error) {
    console.error('[KnowledgeIndexer] Error indexing knowledge base:', error);
  }
}

/**
 * Retrieves relevant context from the indexed knowledge base.
 * @param queryText The user's query.
 * @param count The number of relevant chunks to retrieve.
 * @returns An array of strings, each representing a relevant chunk of text.
 */
export async function retrieveRelevantContext(queryText: string, count: number = 3): Promise<string[]> {
  if (indexedDocuments.length === 0) {
    console.warn("[KnowledgeIndexer] retrieveRelevantContext: Knowledge base not indexed. Attempting to index now.");
    await indexKnowledgeBase();
    if (indexedDocuments.length === 0) {
        console.warn('[KnowledgeIndexer] retrieveRelevantContext: Knowledge base is empty or failed to index.');
        return [];
    }
  }

  const retrieverToUse = getInitializedKnowledgeRetriever(); // Get the (possibly newly initialized) retriever
  
  console.log(`[KnowledgeIndexer] retrieveRelevantContext: Retrieving context for query: "${queryText.substring(0,100)}..."`);
  try {
    const documents: Document[] = await ai.retrieve({
      retriever: retrieverToUse,
      query: queryText, // queryText is a string here
      options: { k: count },
    });
    console.log(`[KnowledgeIndexer] retrieveRelevantContext: Retrieved ${documents.length} documents.`);
    return documents.map((doc: Document) => doc.content[0]?.text || '').filter(text => text.length > 0);
  } catch (error) {
    console.error('[KnowledgeIndexer] retrieveRelevantContext: Error during retrieval:', error);
    return [];
  }
}
