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
                preview: `<span class="preview-tag tag-useful">ARQUIVO-CHAVE</span><br><br>
Planilha com três abas:<br>
<b>Aba "Fornecedores"</b> — lista 11 empresas. Três delas não aparecem em nenhum CNPJ válido.<br>
<b>Aba "Pagamentos"</b> — R$ 12.400, R$ 8.750, R$ 21.000 transferidos em datas irregulares.<br>
<b>Aba "Saldo"</b> — coluna "devedor pessoal": R$ 278.400. Atualizado manualmente.<br><br>
<i>Não é da empresa. É dele.</i>`
              },
              'controle_pessoal_v1.xlsx': {
                type: 'file', kind: 'trap',
                preview: `<span class="preview-tag tag-trap">DISTRAÇÃO</span><br><br>
Versão antiga da planilha. Valores menores, menos fornecedores fictícios.<br>
Pode confundir o jogador — os números não batem com a v3.<br><br>
<i>Irrelevante para o confronto, mas confirma que o desvio é progressivo.</i>`
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
            preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>
Carta não enviada. Destinatário: "Rodrigo" (provavelmente o agiota).<br><br>
"Rodrigo, preciso de mais 30 dias. Minha família não tem nada a ver com isso.<br>
Estou trabalhando para fechar o valor. Por favor."<br><br>
<i>Revela que Carlos está sendo ameaçado fisicamente.</i>`
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
        preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>
Histórico de apostas. Total apostado: R$ 312.800. Taxa de acerto: 31%.<br><br>
<i>Prova irrefutável do vício. Pode ser usado para ameaçar ou para criar empatia.</i>`
      }
    }
  },
  '/AppData/Temp': {
    type: 'folder',
    children: {
      'chat_whatsapp_backup_parcial.txt': {
        type: 'file', kind: 'useful',
        preview: `<span class="preview-tag tag-useful">ÚTIL</span><br><br>
Backup de conversa com "R":<br>
"R: Você tem até dia 15. Depois disso não é mais dinheiro que a gente quer."<br><br>
<i>Confirma ameaça física.</i>`
      }
    }
  }
};

export const carlosPhases = [
  {
    label: 'FASE 1 — PRIMEIRO CONTATO',
    carlos: ['[REMOTE_TERMINAL_ESTABLISHED]','Quem é você...? Como acessou esse chat?'],
    choices: [
      { text: 'Encontrei seus arquivos, Carlos. A planilha v3. Os fornecedores que não existem.', da: 20, next: 1, eff: 'pressure' },
      { text: 'Não precisa saber quem sou. Precisa saber que eu posso ajudar você.', da: 10, next: 1, eff: 'neutral' },
      { text: 'Você sabe o que acontece com contadores que desviam dinheiro de construtoras?', da: -5, next: 1, eff: 'hostile' }
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
      { text: '> "Eu vi o chat com \'R\'. Dia 15, Carlos. Quanto tempo falta?"', da: 25, next: 2, eff: 'empathy' },
      { text: '> "Trabalho para pessoas que podem fazer essa dívida desaparecer."', da: 15, next: 2, eff: 'offer' },
      { text: '> "Tenho cópias de tudo. Um clique e chega no seu chefe."', da: 5, next: 2, eff: 'threat' }
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
      { text: '> "Preciso que você deixe uma porta aberta no sistema da subestação sul."', da: 20, next: 3, eff: 'ask' },
      { text: '> "Preciso de um favor técnico. Nada de sangue."', da: 10, next: 3, eff: 'vague' },
    ]
  },
  {
    label: 'FASE 4 — HESITAÇÃO',
    responses: {
      ask: 'Subestação sul... isso é infraestrutura da cidade. O que vai acontecer?',
      vague: 'Não gosto disso. "Não precisa saber" é sinal de problema.'
    },
    choices: [
      { text: '> "Vai acontecer um apagão localizado. Ninguém morre. Sua dívida some."', da: 30, next: 4, eff: 'deal' },
      { text: '> "Pensa na sua família, Carlos. No Rodrigo. No dia 15."', da: 20, next: 4, eff: 'family' },
    ]
  },
  {
    label: 'FASE 5 — DECISÃO FINAL',
    responses: {
      deal: '...Um apagão. Só isso? E minha família fica fora disso?',
      family: '[sem resposta por 40 segundos] Tá. O que precisa exatamente?'
    },
    choices: [
      { text: '> "Sua família fica fora. Você some do mapa depois. Novo começo."', da: 20, next: 5, eff: 'yes' },
    ]
  }
];