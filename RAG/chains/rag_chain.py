class RAGChain:
    def __init__(self, retriever, generator):
        """
        retriever → retrieves relevant chunks
        generator → generates final answer with citations
        """
        self.retriever = retriever
        self.generator = generator

    def run(self, query: str) -> dict:
        """
        Full RAG pipeline:
        1. Retrieve top-k relevant chunks
        2. Generate answer with inline citation markers
        3. Return answer + context + citation indices
        """
        # 1. Retrieve
        context_chunks = self.retriever.retrieve(query, k=5)

        # 2. Generate (now returns dict with answer + citations)
        result = self.generator.generate_answer(query, context_chunks)

        return {
            "query": query,
            "context": context_chunks,
            "answer": result["answer"],
            "citations": result.get("citations", []),
        }