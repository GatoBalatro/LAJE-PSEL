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
    renata: ['[SYSTEM]: ALERTA DE ACESSO REMOTO NÃO AUTORIZADO', 'Quem acessou meu computador?', 'Tem 30 segundos pra explicar antes de eu chamar a polícia.'],
    choices: [
      { text: 'root@nexus:~# inject --msg "Eu li seus arquivos..."', da: 5, ds: 5, next: 1, eff: 'expose' }, // Sem arquivo (afinidade reduzida)
      { text: 'root@nexus:~# send --target "Delta_Info"', da: 2, ds: 20, next: 1, eff: 'delta' }, // Sem arquivo
      { text: 'root@nexus:~# run exploit.sh --vague', da: 0, ds: 10, next: 1, eff: 'vague' },
    ]
  },
  {
    label: 'FASE 2 — REAÇÃO',
    responses: {
      expose: 'Crime. Sim, foi. Mas isso não explica por que você invadiu meu computador. O que você quer provar, e pra quem?',
      delta: '[pausa] Como você sabe sobre a Delta? Quem te mandou?',
      vague: 'Que cidade? Isso é vago demais. Fala de forma clara ou vou encerrar esse chat.'
    },
    choices: [
      // Bloqueado até encontrar o arquivo 'emails_internos_2019.eml'
      { text: '> "Tenho os e-mails entre João Faria e Paulo Melo. Agosto de 2019. Quer ler?"', da: 30, ds: 10, next: 2, eff: 'emails', requiredFile: 'emails_internos_2019.eml' }, 
      { text: '> "Trabalho para pessoas que vão destruir o que a corrupção construiu aqui."', da: 5, ds: 30, next: 2, eff: 'reveal' },
      { text: '> "A cidade vai pagar por ter rejeitado o projeto mais importante da década."', da: 8, ds: 15, next: 2, eff: 'ideology' },
    ]
  },
  {
    label: 'FASE 3 — O PEDIDO',
    responses: {
      emails: '...como você tem esses e-mails? Isso nunca foi público. [pausa] Ok. Estou ouvindo. Mas preciso que seja específico.',
      reveal: 'Destruir. Essa palavra me preocupa. O que exatamente está sendo planejado?',
      ideology: 'Pagar como? Seja direto. Engenheira não trabalha com metáfora.'
    },
    choices: [
      { text: '> "Preciso que você forneça as plantas técnicas da rede de distribuição. Para identificar os pontos críticos."', da: 5, ds: 25, next: 3, eff: 'ask_plants' },
      { text: '> "Preciso que você confirme a localização das válvulas de pressão do sistema sul. Tecnicamente."', da: 10, ds: 20, next: 3, eff: 'ask_tech' },
      { text: '> "A cidade vai sofrer um colapso de infraestrutura. Quero que você saiba que não foi acidente."', da: -10, ds: 40, next: 3, eff: 'honest' },
    ]
  },
  {
    label: 'FASE 4 — CONFRONTO',
    responses: {
      ask_plants: 'Plantas técnicas para "identificar pontos críticos". Isso é sabotagem. Você quer destruir infraestrutura.',
      ask_tech: 'Válvulas de pressão. Você não é pesquisador. Isso é sabotagem industrial. Quem contratou você?',
      honest: '[30 segundos sem resposta] Quem financia isso? Não é ideologia. Há dinheiro nisso.'
    },
    choices: [
      { text: '> "A cidade destruiu seu trabalho. Isso é justo."', da: -15, ds: 35, next: 4, eff: 'justify', danger: true },
      // Bloqueado até encontrar 'ata_reuniao_prefeitura_mar19.docx'
      { text: '> "Você não deve nada a uma reunião que falsificou sua rejeição por inadequação orçamentária."', da: 25, ds: 10, next: 4, eff: 'betray', requiredFile: 'ata_reuniao_prefeitura_mar19.docx' }, 
      { text: '> "Quem financia? Alguém que perdeu tanto quanto você com esse sistema."', da: 0, ds: 40, next: 4, eff: 'lie', secret: true },
    ]
  },
  {
    label: 'FASE 5 — DECISÃO',
    responses: {
      justify: 'Justo. Você usou essa palavra pra descrever destruição de infraestrutura pública. Não. Eu recuso.',
      betray: 'Eu não devo nada. Mas também não vou ajudar a machucar gente que não tem culpa. Quem é o contratante?',
      lie: '[longa pausa] Alguém com acesso a informações que não são públicas, que sabe sobre a Delta, que invadiu meu computador. Vou descobrir quem é você.'
    },
    choices: [
      { text: '> [Insistir] "É a única forma de mudar alguma coisa."', da: -20, ds: 10, next: 5, eff: 'insist', danger: true },
      { text: '> [Recuar] "Tudo bem. Não vou te forçar."', da: 0, ds: 5, next: 5, eff: 'back' },
      { text: '> [Deixar ela investigar] Encerrar o chat sem resposta.', da: 0, ds: 50, next: 5, eff: 'silent', secret: true },
    ]
  }
];