import os
from pinecone import Pinecone, ServerlessSpec
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

class PineconeService:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index_name = os.getenv("PINECONE_INDEX_NAME")
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        if self.index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=self.index_name,
                dimension=384,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        self.index = self.pc.Index(self.index_name)

    def upsert_news(self, news_items, topic: str = "general"):
        topic_clean = topic.lower().strip()
        vectors = []

        for item in news_items:
            embedding = self.embeddings.embed_query(item['text'])
            metadata = item['metadata'].copy()
            metadata['topic'] = topic_clean

            vectors.append({
                "id": item['id'],
                "values": embedding,
                "metadata": metadata
            })

        if vectors:
            self.index.upsert(vectors=vectors)
            print(f"[PINECONE] Upserted {len(vectors)} articles tagged topic='{topic_clean}'")
            
            # Confirm index stats after upsert
            stats = self.index.describe_index_stats()
            print(f"[PINECONE] Total vectors in index: {stats.get('total_vector_count', 'unknown')}")

    def query_news(self, query_text: str, top_k: int = 5) -> dict:
        topic_clean = query_text.lower().strip()
        query_vec = self.embeddings.embed_query(topic_clean)

        print(f"[PINECONE] Querying with filter: topic='{topic_clean}'")

        try:
            results = self.index.query(
                vector=query_vec,
                top_k=top_k,
                filter={"topic": {"$eq": topic_clean}},
                include_metadata=True
            )
            match_count = len(results.get('matches', []))
            print(f"[PINECONE] Filtered query returned {match_count} matches")

            if match_count > 0:
                # Print first match title so we can confirm it's the right topic
                first_title = results['matches'][0].get('metadata', {}).get('title', 'no title')
                print(f"[PINECONE] First match: '{first_title}'")
                return results
            else:
                print(f"[PINECONE] Filter returned 0 — falling back to unfiltered")

        except Exception as e:
            print(f"[PINECONE] Filter error: {e} — falling back to unfiltered")

        results = self.index.query(
            vector=query_vec,
            top_k=top_k,
            include_metadata=True
        )
        print(f"[PINECONE] Unfiltered fallback: {len(results.get('matches', []))} results")
        return results