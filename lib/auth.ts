// Re-export getUserFromToken from auth-server.ts for backward compatibility
// This allows existing code to continue working while maintaining separation of server/client code
export { getUserFromToken } from "./auth-server"
