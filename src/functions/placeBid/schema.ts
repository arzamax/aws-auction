export default {
  type: 'object',
  properties: {
    amount: { type: 'number' }
  },
  required: ['title']
} as const;
