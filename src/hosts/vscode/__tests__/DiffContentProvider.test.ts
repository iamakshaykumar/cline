import assert from "assert";
import { DiffContentProvider } from "../DiffContentProvider";

describe("DiffContentProvider", () => {
    it("should provide text document content", () => {
        const provider = new DiffContentProvider();
        const content = "Hello World";
        const encoded = Buffer.from(content).toString("base64");
        // Mock URI object
        const uri = { query: encoded } as any;

        const result = provider.provideTextDocumentContent(uri);
        assert.strictEqual(result, content);
    });
});
