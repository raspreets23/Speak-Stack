import { baseProcedure, createTRPCRouter } from "../init";
import { generationsRouter } from "./generations";
import { voicesRouter } from "./voices";

export const appRouter = createTRPCRouter({
  voices: voicesRouter,
  generations: generationsRouter,
});
// export type definition of API
console.log("Procedures in appRouter:", Object.keys(appRouter._def.procedures));
export type AppRouter = typeof appRouter;
