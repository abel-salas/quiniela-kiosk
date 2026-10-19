export default {
  name: 'lotteryDraw',
  title: 'Sorteo de Lotería',
  type: 'document',
  fields: [
    {
      name: 'game',
      title: 'Juego',
      type: 'string',
      options: {
        list: [
          { title: 'Bonoloto', value: 'BONO' },
          { title: 'El Gordo de la Primitiva', value: 'ELGR' },
          { title: 'La Primitiva', value: 'LAPR' },
          { title: 'Euromillones', value: 'EMIL' },
          { title: 'Lotería Nacional', value: 'LNAC' },
          { title: 'La Quiniela', value: 'LAQU' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Fecha del sorteo',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'scheduledDate',
      title: 'Fecha programada',
      type: 'date',
    },
    {
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Celebrado', value: 'celebrado' },
          { title: 'Pendiente', value: 'pendiente' },
        ],
      },
      initialValue: 'celebrado',
    },
    {
      name: 'updatedAt',
      title: 'Fecha de actualización',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'combinacion',
      title: 'Combinación',
      type: 'string',
    },
    {
      name: 'combinacionActa',
      title: 'Combinación Acta',
      type: 'string',
    },
    // Campos para juegos de números (BONO, LAPR)
    {
      name: 'numbers',
      title: 'Números',
      type: 'array',
      of: [{ type: 'number' }],
      hidden: ({ document }) => document?.game !== 'BONO' && document?.game !== 'LAPR',
    },
    {
      name: 'complementario',
      title: 'Complementario',
      type: 'number',
      hidden: ({ document }) => document?.game !== 'BONO' && document?.game !== 'LAPR',
    },
    {
      name: 'reintegro',
      title: 'Reintegro',
      type: 'number',
      hidden: ({ document }) => document?.game !== 'BONO' && document?.game !== 'LAPR' && document?.game !== 'ELGR',
    },
    {
      name: 'joker',
      title: 'Joker',
      type: 'string',
      hidden: ({ document }) => document?.game !== 'LAPR',
    },
    // Campos para Euromillones
    {
      name: 'stars',
      title: 'Estrellas',
      type: 'array',
      of: [{ type: 'number' }],
      hidden: ({ document }) => document?.game !== 'EMIL',
    },
    // Campos para El Gordo
    {
      name: 'clave',
      title: 'Clave',
      type: 'string',
      hidden: ({ document }) => document?.game !== 'ELGR',
    },
    // Campos para Lotería Nacional
    {
      name: 'primerPremio',
      title: 'Primer Premio',
      type: 'string',
      hidden: ({ document }) => document?.game !== 'LNAC',
    },
    {
      name: 'segundoPremio',
      title: 'Segundo Premio',
      type: 'string',
      hidden: ({ document }) => document?.game !== 'LNAC',
    },
    {
      name: 'reintegros',
      title: 'Reintegros',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }) => document?.game !== 'LNAC',
    },
    // Campos para La Quiniela
    {
      name: 'jornada',
      title: 'Jornada',
      type: 'number',
      hidden: ({ document }) => document?.game !== 'LAQU',
    },
    {
      name: 'fecha',
      title: 'Fecha (Quiniela)',
      type: 'date',
      hidden: ({ document }) => document?.game !== 'LAQU',
    },
    {
      name: 'fecha_completa',
      title: 'Fecha completa',
      type: 'datetime',
      hidden: ({ document }) => document?.game !== 'LAQU',
    },
    {
      name: 'signs',
      title: 'Signos',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }) => document?.game !== 'LAQU',
    },
    {
      name: 'matches',
      title: 'Partidos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'local', title: 'Local', type: 'string' },
            { name: 'visitor', title: 'Visitante', type: 'string' },
            { name: 'result', title: 'Resultado', type: 'string' },
            { name: 'fecha_completa', title: 'Fecha completa', type: 'datetime' },
          ],
        },
      ],
      hidden: ({ document }) => document?.game !== 'LAQU',
    },
    {
      name: 'plenoAl15',
      title: 'Pleno al 15',
      type: 'string',
      hidden: ({ document }) => document?.game !== 'LAQU',
    },
  ],
};
