import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
const prescriptionUniqueSchema = z.object({
  prescription_id: z.string({
    required_error: "Describe your basic units name",
  }),
});
const prescriptionFindByPatientSchema = z.object({
  patient_id: z.string({
    required_error: "Describe your basic units name",
  }),
});
const prescriptionInputSchema = z.object({
  patient_id: z.string({
    required_error: "Describe your basic units name",
  }),
  prescription_id: z.string({
    required_error: "Describe your basic units name",
  }),
  date: z.date({ required_error: "Describe your basic units name" }),
  symptom: z.string({
    required_error: "Describe your basic units name",
  }),
  bp: z.string(),
  diagnosis: z.string({
    required_error: "Describe your basic units name",
  }),
  weight: z.string(),
  note: z.string(),
  tests: z.string(),
  reports: z.string(),
  medicine: z.array(
    z.object({
      medicine: z.string({
        required_error: "Describe your basic units name",
      }),
      repeatitions: z.string({
        required_error: "Describe your basic units name",
      }),
      id: z.string({
        required_error: "Describe your basic units name",
      }),
    }),
  ),
});
const prescriptionTestReportInputSchema = z.object({
  prescription_id: z.string({
    required_error: "Describe your basic units name",
  }),
  date: z.date({ required_error: "Describe your basic units name" }),
  test_report: z.string({
    required_error: "Describe your basic units name",
  }),
});
const prescriptionMultipleTestReportInputSchema = z.object({
  prescription_id: z.string({
    required_error: "Describe your basic units name",
  }),
  date: z.date({ required_error: "Describe your basic units name" }),
  test_report: z.array(
    z.string({
      required_error: "Describe your basic units name",
    }),
  ),
});
export const prescriptionRouter = createTRPCRouter({
  get_all: protectedProcedure.query(async ({ ctx, input }) => {
    const prescriptions = await ctx.db.prescription.findMany();
    await ctx.db.$disconnect();
    return prescriptions;
  }),
  get_by_id: protectedProcedure
    .input(prescriptionUniqueSchema)
    .query(async ({ ctx, input }) => {
      const prescription = await ctx.db.prescription.findUnique({
        where: {
          prescription_id: input.prescription_id,
        },
      });
      await ctx.db.$disconnect();
      return prescription;
    }),
  get_whole_prescription_data_by_id: protectedProcedure
    .input(prescriptionUniqueSchema)
    .query(async ({ ctx, input }) => {
      const prescription = await ctx.db.prescription.findUnique({
        where: {
          prescription_id: input.prescription_id,
        },
      });
      const prescription_data = await ctx.db.prescriptionMedicineData.findMany({
        where: { prescription_id: input.prescription_id },
      });
      await ctx.db.$disconnect();
      return {
        prescription: prescription,
        prescription_data: prescription_data,
      };
    }),
  get_prescription_medicine_data: protectedProcedure
    .input(prescriptionUniqueSchema)
    .query(async ({ ctx, input }) => {
      const prescription = await ctx.db.prescriptionMedicineData.findMany({
        where: {
          prescription_id: input.prescription_id,
        },
      });
      await ctx.db.$disconnect();
      return prescription;
    }),
  get_by_patient_id: protectedProcedure
    .input(prescriptionFindByPatientSchema)
    .query(async ({ ctx, input }) => {
      const prescription = await ctx.db.prescription.findMany({
        where: {
          patient_id: input.patient_id,
        },
      });
      await ctx.db.$disconnect();
      return prescription;
    }),
  create_prescription: protectedProcedure
    .input(prescriptionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const arr = [];
      arr.push(
        ctx.db.prescription.create({
          data: {
            bp: input.bp,
            date: input.date,
            diagnosis: input.diagnosis,
            patient_id: input.patient_id,
            symptom: input.symptom,
            weight: parseInt(input.weight),
            note: input.note,
            reports: input.reports,
            prescription_id: input.prescription_id,
            tests: input.tests,
          },
        }),
      );
      input.medicine.map((item) => {
        arr.push(
          ctx.db.prescriptionMedicineData.create({
            data: {
              date: input.date,
              medicine: item.medicine,
              patient_id: input.patient_id,
              repeatitions: item.repeatitions,
              prescription_id: input.prescription_id,
            },
          }),
        );
        arr.push(
          ctx.db.medicine.upsert({
            create: { name: item.medicine },
            update: { name: item.medicine },
            where: { name: item.medicine },
          }),
        );
        arr.push(
          ctx.db.repetitions.upsert({
            create: { name: item.repeatitions },
            update: { name: item.repeatitions },
            where: { name: item.repeatitions },
          }),
        );
      });
      await ctx.db.$transaction(arr);
    }),
  upload_test_report: protectedProcedure
    .input(prescriptionTestReportInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.prescriptionTestReport.create({
        data: {
          date: input.date,
          prescription_id: input.prescription_id,
          test_report: input.test_report,
        },
      });
    }),
  upload_multiple_test_report: protectedProcedure
    .input(prescriptionMultipleTestReportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const arr = [];
      for (let i = 0; i < input.test_report.length; i++) {
        arr.push(
          ctx.db.prescriptionTestReport.upsert({
            create: {
              date: input.date,
              prescription_id: input.prescription_id,
              test_report: input.test_report[i] as string,
            },
            update: {
              date: input.date,
              prescription_id: input.prescription_id,
              test_report: input.test_report[i] as string,
            },
            where: {
              test_report: input.test_report[i],
            },
          }),
        );
      }
      return await ctx.db.$transaction(arr);
    }),
  ger_test_report_by_prescription_id: protectedProcedure
    .input(prescriptionUniqueSchema)
    .query(async ({ ctx, input }) => {
      const reports = await ctx.db.prescriptionTestReport.findMany({
        where: {
          prescription_id: input.prescription_id,
        },
      });
      await ctx.db.$disconnect();
      return reports;
    }),
  get_all_test_report: protectedProcedure.query(async ({ ctx }) => {
    const reports = await ctx.db.prescriptionTestReport.findMany();
    await ctx.db.$disconnect();
    return reports;
  }),
});
