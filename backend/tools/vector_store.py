import os
from typing import List, Dict, Any

try:
    import chromadb
    CHROMA_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")
    
    class VectorStoreManager:
        def __init__(self):
            self.client = chromadb.PersistentClient(path=CHROMA_DIR)
            self.collection = self.client.get_or_create_collection(name="research_docs")

        def add_documents(self, session_id: str, chunks: List[str], metadatas: List[Dict[str, Any]]):
            ids = [f"{session_id}_{i}" for i in range(len(chunks))]
            self.collection.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )

        def query(self, session_id: str, query_text: str, n_results: int = 4) -> List[Dict[str, Any]]:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where={"session_id": session_id} if session_id else None
            )
            
            output = []
            if results and "documents" in results and results["documents"]:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
                for doc, meta in zip(docs, metas):
                    output.append({
                        "content": doc,
                        "metadata": meta
                    })
            return output

except ImportError:
    class VectorStoreManager:
        def __init__(self):
            self.store = {}

        def add_documents(self, session_id: str, chunks: List[str], metadatas: List[Dict[str, Any]]):
            if session_id not in self.store:
                self.store[session_id] = []
            for chunk, meta in zip(chunks, metadatas):
                self.store[session_id].append({"content": chunk, "metadata": meta})

        def query(self, session_id: str, query_text: str, n_results: int = 4) -> List[Dict[str, Any]]:
            docs = self.store.get(session_id, [])
            return docs[:n_results]

vector_store = VectorStoreManager()

