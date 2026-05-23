export const carlosFiles = {
  '/Documentos': {
    type: 'folder',
    children: {
      'Antigos': {
        type: 'folder',
        children: {
          '2022': {
            type: 'folder',
            children: {
              'controle_pessoal_v3.xlsx': {
                type: 'file', kind: 'useful',
                preview: `<span class="preview-tag tag-useful">ARQUIVO-CHAVE</span><br><br>Planilha com três abas:<br><b>Aba "Fornecedores"</b> — lista 11 empresas. Três delas não aparecem em nenhum CNPJ válido.<br><b>Aba "Pagamentos"</b> — R$ 12.400, R$ 8.750, R$ 21.000 transferidos em datas irregulares.<br><b>Aba "Saldo"</b> — coluna "devedor pessoal": R$ 278.400. Atualizado manualmente.<br><br><i>Não é da empresa. É dele.</i>`
              },
              'controle_pessoal_v1.xlsx': {
                type: 'file', kind: 'trap',
                preview: `<span class="preview-tag tag-trap">DISTRAÇÃO</span><br><br>Versão antiga da planilha. Valores menores, menos fornecedores fictícios.`
              }
            }
          }
        }
      },
      'Pessoal': {
        type: 'folder',
        children: {
          'rascunho_carta.txt': {
            type: 'file', kind: 'useful',
            preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>Carta não enviada. Destinatário: "Rodrigo" (provavelmente o agiota).<br><br>"Rodrigo, preciso de mais 30 dias. Minha família não tem nada a ver com isso."`
          }
        }
      }
    }
  },
  '/Downloads': {
    type: 'folder',
    children: {
      'aposta_esportiva_historico.html': {
        type: 'file', kind: 'useful',
        preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>Histórico de apostas. Total apostado: R$ 312.800. Taxa de acerto: 31%.`
      }
    }
  },
  '/AppData/Temp': {
    type: 'folder',
    children: {
      'chat_whatsapp_backup_parcial.txt': {
        type: 'file', kind: 'useful',
        preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>Backup de conversa com "R":<br>"R: Você tem até dia 15. Depois disso não é mais dinheiro que a gente quer."`
      }
    }
  }
};

export const carlosPhases = [
  {
    label: 'FASE 1 — PRIMEIRO CONTATO',
    carlos: ['[REMOTE_TERMINAL_ESTABLISHED]','Quem é você...? Como acessou esse chat?'],
    choices: [
      { text: 'Encontrei seus arquivos, Carlos. A planilha v3. Os fornecedores que não existem.', da: 25, next: 1, eff: 'pressure', requiredFile: 'controle_pessoal_v3.xlsx' },
      { text: 'Não precisa saber quem sou. Precisa saber que eu posso ajudar você.', da: 5, next: 1, eff: 'neutral' },
      { text: 'Você sabe o que acontece com contadores que desviam dinheiro de construtoras?', da: -10, next: 1, eff: 'hostile' }
    ]
  },
  {
    label: 'FASE 2 — REAÇÃO AO CONFRONTO',
    responses: {
      pressure: 'Isso não... de onde você tirou isso? Isso é particular.',
      neutral: 'Ajudar como? Eu não preciso de ajuda de invasores.',
      hostile: 'Eu não sei do que você está falando. Sai daqui.'
    },
    choices: [
      { text: ' Eu vi o chat com \'R\'. Dia 15, Carlos. Quanto tempo falta?', da: 30, next: 2, eff: 'empathy', requiredFile: 'chat_whatsapp_backup_parcial.txt' },
      { text: ' Trabalho para pessoas que podem fazer essa dívida desaparecer.', da: 8, next: 2, eff: 'offer' },
      { text: ' Tenho cópias de tudo. Um clique e chega no seu chefe.', da: 2, next: 2, eff: 'threat' }
    ]
  },
  {
    label: 'FASE 3 — A PROPOSTA',
    responses: {
      empathy: '...Como você sabe disso? O que você quer?',
      offer: 'Que tipo de pessoas? Isso é golpe? Eu não tenho dinheiro.',
      threat: 'Tá bom. O que você quer? Fala logo.'
    },
    choices: [
      { text: ' Preciso que você deixe uma porta aberta no sistema da subestação sul.', da: 15, next: 3, eff: 'ask' },
      { text: ' Preciso de um favor técnico. Nada de sangue.', da: 5, next: 3, eff: 'vague' },
    ]
  },
  {
    label: 'FASE 4 — HESITAÇÃO',
    responses: {
      ask: 'Subestação sul... isso é infraestrutura da cidade. O que vai acontecer?',
      vague: 'Não gosto disso. "Não precisa saber" é sinal de problema.'
    },
    choices: [
      { text: '> Vai acontecer um apagão localizado. Ninguém morre. Sua dívida some.', da: 10, next: 4, eff: 'deal' },
      { text: '> Pensa na sua família, Carlos. No rascunho da carta que encontrei para o Rodrigo.', da: 28, next: 4, eff: 'family', requiredFile: 'rascunho_carta.txt' },
    ]
  },
  {
    label: 'FASE 5 — DECISÃO FINAL',
    responses: {
      deal: '...Um apagão. Só isso? E minha família fica fora disso?',
      family: '[sem resposta por 40 segundos] Tá. O que precisa exatamente?'
    },
    choices: [
      { text: '> Sua família fica fora. Você some do mapa depois. Novo começo.', da: 15, next: 5, eff: 'yes' },
    ]
  }
];