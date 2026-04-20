class RAGChain:
    def __init__(self, retriever, generator):
        """
        retriever → retrieves relevant chunks
        generator → generates final answer
        """
        self.retriever = retriever
        self.generator = generator

    def run(self, query: str):
        """
        Full RAG pipeline execution
        """

        # 1. Retrieve relevant context
        context_chunks = self.retriever.retrieve(query, k=5)

        # 2. Generate answer using context
        answer = self.generator.generate_answer(query, context_chunks)

        return {
            "query": query,
            "context": context_chunks,
            "answer": answer
        }