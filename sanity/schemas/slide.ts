import { defineField, defineType, type PreviewValue } from 'sanity';

export const slide = defineType({
  name: 'slide',
  title: 'Slide',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      description: 'Solo para identificarlo en el Studio',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Activo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'title', order: 'order', media: 'image' },
    prepare: ({ title, order, media }: { title?: string; order?: number; media?: PreviewValue['media'] }) => ({
      title: title ?? 'Sin título',
      subtitle: order === undefined ? undefined : `Orden ${order}`,
      media,
    }),
  },
});
