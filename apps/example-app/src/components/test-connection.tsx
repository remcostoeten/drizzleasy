import { testConnection } from "@/server/test-connection";

export default async function TestConnection() {
    const result = await testConnection();
    return (
        <>      <h1>Test Connection Result</h1>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </>);
}