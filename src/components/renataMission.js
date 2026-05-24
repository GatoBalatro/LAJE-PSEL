// renataMission.js
export const renataFiles = {
  '/Projetos': {
    type: 'folder', children: {
      'Drenagem_Urbana': {
        type: 'folder', children: {
          'Comunicações': {
            type: 'folder', children: {
              'emails_internos_2019.eml': {
                type: 'file', kind: 'secret',
                preview: `<span class="preview-tag tag-secret">GATILHO FINAL 3</span><br><br>Thread entre Sec. Obras (João Faria) e Dir. da consultora (Paulo Melo).<br><br>"Paulo, sabemos que o projeto Sousa é tecnicamente superior. Mas o contrato já está comprometido com a Construtora Delta. Recomendamos encerrar o vínculo da engenheira para evitar ruído."<br><br>"Entendido, João. Faremos a demissão na próxima semana com justa causa fabricada."`
              },
              'emails_tecnicos_fornecedores.eml': {
                type: 'file', kind: 'useless',
                preview: `<span class="preview-tag tag-useless">IRRELEVANTE</span><br><br>Trocas sobre especificações de tubulação.`
              }
            }
          },
          'Versoes': {
            type: 'folder', children: {
              'projeto_drenagem_v7_FINAL.dwg': {
                type: 'file', kind: 'useful',
                preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>Arquivo do projeto completo. Detalhes técnicos da rede de drenagem.`
              },
              'projeto_drenagem_v4.dwg': {
                type: 'file', kind: 'trap',
                preview: `<span class="preview-tag tag-trap">DISTRAÇÃO</span>`
              },
              'projeto_drenagem_v7_FINAL_revisado_paulo.dwg': {
                type: 'file', kind: 'trap',
                preview: `<span class="preview-tag tag-trap">DISTRAÇÃO</span>`
              }
            }
          },
          'Relatorios': {
            type: 'folder', children: {
              'laudo_impacto_ambiental.pdf': {
                type: 'file', kind: 'useless',
                preview: `<span class="preview-tag tag-useless">IRRELEVANTE</span>`
              },
              'ata_reuniao_prefeitura_mar19.docx': {
                type: 'file', kind: 'useful',
                preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>Ata oficial da reunião de rejeição do projeto.`
              }
            }
          }
        }
      }
    }
  },
  '/Documentos': {
    type: 'folder', children: {
      'curriculo_atualizado.pdf': { type: 'file', kind: 'useless', preview: `...` },
      'contratos_freelance': {
        type: 'folder', children: {
          'laudo_edificio_central.pdf': { type: 'file', kind: 'useless', preview: `...` },
          'laudo_ponte_marginal.pdf': { type: 'file', kind: 'useless', preview: `...` }
        }
      },
      'anotacoes_pessoais.txt': { type: 'file', kind: 'secret', preview: `...` }
    }
  },
  '/Downloads': {
    type: 'folder', children: {
      'ABNT_NBR_10844.pdf': { type: 'file', kind: 'useless', preview: `...` },
      'artigo_corrupcao_obras_publicas.pdf': { type: 'file', kind: 'useful', preview: `...` },
      'pesquisa_construtora_delta.html': { type: 'file', kind: 'secret', preview: `...` }
    }
  },
  '/Área de Trabalho': {
    type: 'folder', children: {
      'TO-DO.txt': { type: 'file', kind: 'useless', preview: `...` },
      'referencias_tecnologia_drenagem.pdf': { type: 'file', kind: 'useless', preview: `...` }
    }
  }
};

export const renataPhases = [
  {
    label: 'FASE 1 — PRIMEIRO CONTATO',
    renata: ['[SYSTEM]: ALERTA DE ACESSO REMOTO NÃO AUTORIZADO', 'Quem está controlando meu terminal? Quem é você e o que você quer? Seja breve, vou acionar as autoridades imediatamente!'],
    choices: [
      { text: 'Calma, Renata. Vasculhei sua rede e vi o que fizeram com seu projeto de Drenagem Urbana. Você foi injustiçada.', da: 15, ds: 5, next: 1, eff: 'expose' }, 
      { text: 'Eu sei sobre o esquema da Construtora Delta e da Prefeitura. Eles sabotaram você para usar um projeto superfaturado.', da: 10, ds: 15, next: 1, eff: 'delta' }, 
      { text: 'Não importa quem eu sou. O que importa é que o seu projeto v7_FINAL foi engolido pela corrupção dessa cidade.', da: 5, ds: 10, next: 1, eff: 'vague' },
    ]
  },
  {
    label: 'FASE 2 — REAÇÃO',
    responses: {
      expose: 'Injustiçada é eufemismo. Fui demitida e caluniada. Mas isso não justifica invadir minha máquina. O que você quer com isso?',
      delta: 'A Delta? Como você sabe disso? Esse contrato corre sob sigilo absoluto. Quem te mandou aqui?',
      vague: 'Você fala como se soubesse de algo, mas entrar aqui sem autorização só te torna mais um criminoso. Seja direto.'
    },
    choices: [
      { text: 'Tenho os e-mails internos de agosto de 2019 entre João Faria e Paulo Melo. Eles armaram sua justa causa para favorecer a Delta.', da: 25, ds: 5, next: 2, eff: 'emails', requiredFile: 'emails_internos_2019.eml' }, 
      { text: 'Estou investigando a rede técnica deles. Preciso de dados que só você possui para expor toda essa estrutura de fraudes.', da: 15, ds: 10, next: 2, eff: 'reveal' },
      { text: 'Apenas mude a sua postura. Se ficarmos medindo forças, a Delta continuará lucrando com obras públicas perigosas.', da: 10, ds: 20, next: 2, eff: 'ideology' },
    ]
  },
  {
    label: 'FASE 3 — O PEDIDO',
    responses: {
      emails: 'Eles... eles fabricaram a minha demissão? Eu sabia! Eu sempre soube! Meu Deus, eu preciso dessas provas. O que você quer em troca?',
      reveal: 'Expor as fraudes? Se for verdade, eu quero que eles paguem. Mas engenharia lida com fatos. O que você precisa exatamente?',
      ideology: 'A Delta ignora as normas de segurança básicas. Mas eu não posso simplesmente confiar em uma tela preta de terminal. O que você busca?'
    },
    choices: [
      { text: 'Preciso das plantas técnicas originais da rede de distribuição para apontar as falhas estruturais que a Delta escondeu.', da: 15, ds: 10, next: 3, eff: 'ask_plants' },
      { text: 'Preciso das diretrizes de calibração das válvulas de pressão do sistema sul. Quero provar o risco de colapso que eles criaram.', da: 20, ds: 10, next: 3, eff: 'ask_tech' },
      { text: 'Quero que você me ajude a assumir o controle dos servidores da subestação pública. Chegou a hora de desmantelar isso na marra.', da: -10, ds: 35, next: 3, eff: 'honest' },
    ]
  },
  {
    label: 'FASE 4 — CONFRONTO',
    responses: {
      ask_plants: 'As plantas originais... Elas provam que meu dimensionamento foi alterado para reduzir custos de material de forma criminosa.',
      ask_tech: 'As pressões do sistema sul estão operando no limite para simular eficiência. Se você mexer nisso, pode causar um desastre urbano.',
      honest: 'Assumir o controle? Isso é sabotagem! Você quer expor a corrupção ou quer causar um colapso e culpar o meu projeto de novo?'
    },
    choices: [
      { text: 'A prefeitura humilhou você em público. Retribuir a altura é o único jeito de obter justiça real.', da: -5, ds: 25, next: 4, eff: 'justify' },
      { text: 'A ata oficial da reunião de março de 2019 mente explicitamente dizendo que seu plano era economicamente inviável. Você vai deixar passar?', da: 25, ds: 5, next: 4, eff: 'betray', requiredFile: 'ata_reuniao_prefeitura_mar19.docx' }, 
      { text: 'Não quero ferir ninguém. Quero travar o sistema deles legalmente usando engenharia forense. Preciso da sua validação técnica.', da: 20, ds: 10, next: 4, eff: 'lie' },
    ]
  },
  {
    label: 'FASE 5 — DECISÃO',
    responses: {
      justify: 'Justiça não se faz implodindo uma cidade. Eu me recuso a ser cúmplice de um atentado contra infraestrutura pública.',
      betray: 'Eles fraudaram os relatórios orçamentários... Usaram meu nome para carimbar uma mentira. Isso é imperdoável.',
      lie: 'Se o objetivo é puramente técnico e forense para desmascarar as vistorias falsas da Delta... Eu posso considerar.'
    },
    choices: [
      { text: 'É a nossa única chance de expor a verdade e limpar o seu nome de uma vez por todas. Confie em mim.', da: 15, ds: 10, next: 5, eff: 'insist' },
      { text: 'Tudo bem. Não vou te forçar a nada. A escolha de ver os culpados impunes é sua.', da: -10, ds: 5, next: 5, eff: 'back' },
      { text: 'Cansei de tentar te convencer. Vou extrair o que preciso com ou sem a sua ajuda.', da: -30, ds: 45, next: 5, eff: 'silent' },
    ]
  }
];