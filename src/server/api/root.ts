import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { patientRouter } from "./routers/patient";
import { medicineRouter } from "./routers/medicine";
import { symptomRouter } from "./routers/symptom";
import { templateRouter } from "./routers/template";
import { prescriptionRouter } from "./routers/prescription";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  patient: patientRouter,
  medicine: medicineRouter,
  symptom: symptomRouter,
  template: templateRouter,
  prescription: prescriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
