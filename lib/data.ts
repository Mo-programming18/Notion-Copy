/**
 * Backwards-compatible data access barrel.
 *
 * All implementation lives in modular services so routes and components can
 * import only the capability they need.
 */
export * from "@/lib/services/page-store";
export * from "@/lib/services/workspace-service";
