export const POST_TAGS = ['PESQUISA', 'PROJETOS', 'ATIVIDADES', 'CURSOS & EVENTOS'] as const;
export type PostTag = typeof POST_TAGS[number];

export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'PESQUISA':        { bg: '#e8f0f7', text: '#004267' },
  'PROJETOS':        { bg: '#e8f5ee', text: '#1a6b3c' },
  'ATIVIDADES':      { bg: '#fef3e2', text: '#8a4f00' },
  'CURSOS & EVENTOS':{ bg: '#f0ebf8', text: '#5c2d8a' },
};
