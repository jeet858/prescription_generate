import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { it } from "node:test";

const templateInputSchema = z.object({
  template_id: z.string({
    required_error: "Describe your basic units name",
  }),
  description: z.string(),
  template_data: z.array(
    z.object({
      id: z.string({
        required_error: "Describe your basic units name",
      }),
      medicine: z.string({
        required_error: "Describe your basic units name",
      }),
      repeatitions: z.string({
        required_error: "Describe your basic units name",
      }),
    }),
  ),
});
const findTemplateDataSchema = z.object({
  template_id: z.string({
    required_error: "Describe your basic units name",
  }),
});
const deleteTemplateDataSchema = z.object({
  template_id: z.string({
    required_error: "Describe your basic units name",
  }),
});
export const templateRouter = createTRPCRouter({
  get_all: protectedProcedure.query(async ({ ctx }) => {
    const template = await ctx.db.template.findMany({
      orderBy: {
        template_id: "asc",
      },
    });
    await ctx.db.$disconnect();
    return template;
  }),
  get_all_data: protectedProcedure.query(async ({ ctx }) => {
    const templateData = await ctx.db.templateData.findMany();
    await ctx.db.$disconnect();
    return templateData;
  }),
  template_data_by_id: protectedProcedure
    .input(findTemplateDataSchema)
    .query(async ({ ctx, input }) => {
      const templateData = await ctx.db.templateData.findMany({
        where: {
          template_id: input.template_id,
        },
      });
      await ctx.db.$disconnect();
      return templateData;
    }),
  create_template: protectedProcedure
    .input(templateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const arr = [];
      arr.push(
        ctx.db.templateData.deleteMany({
          where: {
            template_id: input.template_id,
          },
        }),
      );
      const template = ctx.db.template.upsert({
        where: {
          template_id: input.template_id,
        },
        update: {
          template_id: input.template_id,
          description: input.description,
        },
        create: {
          template_id: input.template_id,
          description: input.description,
        },
      });
      arr.push(template);
      input.template_data.forEach((item) => {
        const temp = ctx.db.templateData.upsert({
          where: {
            template_id: input.template_id,
            doseage: item.repeatitions,
            medicine: item.medicine,
            template_id_medicine: {
              medicine: item.medicine,
              template_id: input.template_id,
            },
          },
          create: {
            template_id: input.template_id,
            medicine: item.medicine,
            doseage: item.repeatitions,
          },
          update: {
            template_id: input.template_id,
            medicine: item.medicine,
            doseage: item.repeatitions,
          },
        });
        arr.push(
          ctx.db.medicine.upsert({
            where: { name: item.medicine },
            create: { name: item.medicine },
            update: { name: item.medicine },
          }),
        );
        arr.push(
          ctx.db.repetitions.upsert({
            where: { name: item.repeatitions },
            create: { name: item.repeatitions },
            update: { name: item.repeatitions },
          }),
        );
        arr.push(temp);
      });
      return await ctx.db.$transaction(arr);
    }),
  deleteTemplate: protectedProcedure
    .input(deleteTemplateDataSchema)
    .mutation(async ({ ctx, input }) => {
      const deleteTemplate = ctx.db.template.delete({
        where: { template_id: input.template_id },
      });
      const deleteTemplateData = ctx.db.templateData.deleteMany({
        where: {
          template_id: input.template_id,
        },
      });
      return await ctx.db.$transaction([deleteTemplateData, deleteTemplate]);
    }),
});
