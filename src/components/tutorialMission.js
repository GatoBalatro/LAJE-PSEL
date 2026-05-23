export const tutorialPhases = [
  {
    label: 'TUTORIAL — DIRETOR DE INFRA',
    renata: [
      'Bem-vindo ao sistema, Recruta.',
      'Sua missão é simples: precisamos de acesso à infraestrutura da cidade.',
      'Dois alvos foram identificados: Renata (Engenheira) e Carlos (Contador).',
      'Renata é dura, mas valoriza a verdade. Carlos está acuado por dívidas.',
      'Explore os arquivos deles para encontrar fraquezas e use o CHAT para convencê-los.',
      'Você precisa de pelo menos 50% de influência combinada para prosseguirmos.'
    ],
    choices: [
      { text: '> "Entendido. Vou começar a investigação."', da: 100, next: 1, eff: 'ok' },
      { text: '> "Por que eles ajudariam um hacker?"', da: 100, next: 1, eff: 'why' }
    ]
  },
  {
    label: 'TUTORIAL — CONCLUSÃO',
    responses: {
      ok: 'Ótimo. Use os ícones no desktop. Não me decepcione.',
      why: 'Porque você vai dar a eles o que eles mais querem: justiça ou alívio. Comece agora.'
    },
    choices: []
  }
];