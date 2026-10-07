# Conceito — registro de decisões

Cada decisão: o quê, por quê. Ideias fora do MVP vão para "Depois".

Documentos de apoio:
- [Análise do Copero](referencia-copero.md)
- [Pesquisa de mobilidade entre regiões](pesquisa-mobilidade.md)
- [Pesquisa de força das regiões e ciclos dos times](pesquisa-ciclos-e-forca.md)
- [Design dos sistemas](design-sistemas.md)
- [Catálogo de eventos](eventos.md)
- [Fluxo de telas](telas.md)

## Decidido

- **Processo:** discutir conceito e jogabilidade antes de código; MVP definido ao fim da fase 2; deploy cedo; desenvolvimento em fatias verticais.
- **Referência principal:** o Simulador de Carreira do Copero. Sensação-alvo: o mesmo "vício" de carreiras curtas, poucas decisões com peso e vontade de jogar de novo na hora.
- **Estrutura:** seguir à risca o conceito do Copero.
- **Realismo:** a movimentação entre regiões segue a realidade (importados, residência, fluxos históricos).
- **Milagres:** são **quase zero, nunca zero** (brasileiro na LCK, CBLOL campeão do Worlds). Quando acontecem, viram conquistas lendárias.
- **Nacionalidade:** o jogador escolhe qualquer país. A dificuldade surge da realidade de cada região.
- **Dados: só clubes**, sem colegas de elenco. O que importa é a sua carreira.
- **Nomes, fotos e logos 100% reais**, inclusive dos troféus. Risco conhecido: a política de fã da Riot restringe jogos e apps com IP dela, os logos são marcas dos times e as fotos têm direitos da Riot. Mitigação: projeto gratuito e sem paywall, aviso de não afiliação, assets em arquivo de dados para poderem ser trocados.
- **Troféus (out/2026):** cada competição tem a sua taça, desenhada em SVG no estilo simples do Copero (sem realismo, mas com a silhueta e as cores da taça real). As fotos de referência ficam fora do repositório (`trophieImg/`, ignorada no git).
  - Desenhadas: Worlds, MSI, First Stand, CBLOL, CBLOL Cup, LCK, LPL, LEC, LCS, LCP e Circuito Desafiante.
  - A CBLOL Cup (1º split do CBLOL) tem taça própria e conta separada na vitrine.
  - As outras ligas (tier 2 e 3) usam a taça genérica dourada, com a faixa da base na cor da liga.
  - Uma taça por competição: os títulos de cada split da mesma liga se somam ("3× CBLOL").
- **Tempo:** a unidade é o **split** (3 por ano). Modos Intensa (1 decisão por split), Normal (por ano) e Expressa (a cada 2 anos). As transferências acontecem em qualquer janela, mas a frequência cai nesta ordem: 3→1, depois 2→3, depois 1→2.
- **Janelas com 3 cards (playtest, out/2026):** toda janela de transferência mostra 3 opções:
  - **Normal:** 2 times novos + ficar no time atual.
  - **Fim de ciclo de jovem** (mais comum depois de desempenho ruim, na janela 3→1): 3 times novos.
  - **Fim de ciclo de veterano** (28+): 2 times novos + aposentar.
  - Sem time (agente livre ou streamer): 2 times novos + seguir esperando.
  - Fora da pré-temporada, os times de tier 1 se mexem menos (a qualidade das propostas cai).
- **Sucesso sem garantia:** distribuição-alvo de 30% que nunca se firmam, 40% sólidos, 25% craques e 5% lendas. Sem arquétipo no resumo.
- **Evolução sem teto oculto (out/2026):** não existe potencial nem perfil de desenvolvimento. O caminho do jogador é o OVR que você vê.
  - **Subida natural por split, até os 22**, com sorte:

    | Idade | Subida por split | 🚀 Explosão (só titular) |
    |---|---|---|
    | 16–18 | 0 a 3 (o +1 é o mais comum) | 4% de chance de +4 ou +5 |
    | 19–20 | 0 a 2 | 2,5% |
    | 21–22 | 0 ou 1 | — |
    | 23–26 | estável | — |
    | 27+ | cai (−1 a −2 por ano, mais depois dos 29) | — |

  - **Minutos importam:** jovem titular, inclusive no academy, evolui mais (+25% até os 19); quem não joga evolui menos.
  - **Depois dos 22, só os ups dos eventos fazem subir**: a aposta passa a ser a decisão central da carreira.
  - Referência: no Brasil, o jogador mediano chega a ~76 no auge, e 10% passam de 85.
- **Vantagem inicial por região (out/2026):** o talento de fora chega mais pronto, porque a liga de entrada (LCK CL, LDL, EMEA Masters) é bem mais forte que a Qualificatória Aberta. Em troca, quem chega pronto cresce menos depois (já foi lapidado no sistema de trainees).

  | Região | OVR aos 16 | Subida natural |
  |---|---|---|
  | Coreia | +17 | 60% |
  | China | +16 | 60% |
  | Europa | +9 | 80% |
  | América do Norte | +3 | 100% |
  | Pacífico | +2 | 100% |
  | Brasil e LATAM | 0 (a referência) | 100% |

  O coreano vira titular aos 17,3 em média, e o topo dele chega aos 90+ da LCK (o Worlds sai em ~6% das carreiras coreanas).
- **Viradas (playtest, out/2026):**
  - **Ups dos eventos:** +2, +3, +4 e +6 (o estimulante). As perdas continuam como eram. Sem teto: cada up soma direto no OVR.
  - **Evento secreto "Convite secreto":** uma lenda aposentada oferece um treino fechado, em um card dourado. Aparece em ~5% das carreiras, 3× mais quando a carreira trava (fora da titularidade, ou 20+ anos longe do tier 1), até os 27 anos. Aceitar: 55% dá +5 OVR, 30% dá +8 OVR ("virada lendária") e 15% dá −2 OVR. É o maior salto do jogo: o jogador mediano pode virar craque.
  - **Código secreto:** 5 toques no selo de OVR em até 2,5 segundos dão +5 OVR, uma vez por carreira. É trapaça assumida: a carreira fica marcada no resumo e não conta para as conquistas.
- **Aposentadoria:** botão separado, discreto, disponível desde o começo, sem idade fixa. É possível pausar (streamer, agente livre) e voltar.
- **OVR regional:** os maiores jogadores do Brasil chegam a 81–84 no auge (o suficiente para uma boa vaga na LEC ou na LCS). A LCK fica nos 90 altos.
- **Tendência dos times:** mostra o nível *no período*. Existe a categoria rara "Projeto ambicioso", que dá muito certo ou falha. O jogador não carrega o time sozinho, mas melhora o desempenho e muda a tendência.
- **Começo:** ofertas variadas entre academy, tier 2 e tier 3. Só é possível estrear no tier 1 a partir dos 18 anos. A organização pode subir ou descer o jogador entre o academy e o time principal.
- **Tier 1 só com titulares (playtest 3, out/2026):**
  - No tier 1 não existe reserva que joga de vez em quando: ou o jogador é titular, ou atua no academy do próprio time (sem academy, fica fora). Menores de 18 em time que subiu também atuam no academy.
  - Times de tier 1 só fazem proposta para titular; quem ainda não tem nível recebe proposta do academy.
  - Na janela, quem perdeu o nível de titular recebe a decisão **"Rebaixado para o academy"**: descer para o academy do time ou assinar com um dos 2 times interessados. Sem academy, é fim de ciclo.
  - Perder espaço por evento (pedir desculpas, disputa de vaga etc.) dura só o próximo split.
  - Régua de titular: até 2 pontos abaixo da força do time para quem chega; **titular estabelecido** (titular do time no split anterior) só perde a vaga se ficar mais de 5 pontos abaixo. O reforço do elenco não derruba quem está rendendo.
- **Lesões mais raras:** ~0,2 por carreira, em qualquer modo (a chance agora é por split jogado).
- **Pré-temporada sem janela roubada:** um evento na janela 3→1 vem antes, e a janela de transferências aparece logo depois.
- **Acesso e rebaixamento (playtest, out/2026):**
  - O convidado que foi campeão de algum split do ano, ou terminou entre os 3 primeiros na média, mantém a vaga sem série.
  - Na série, conta a força com o jogador em quadra.
  - O convidado rebaixado volta para a liga de origem (ex.: a 9z volta para a Liga Regional Sur).
  - Quem sobe é escolhido pela campanha do ano.
  - A subida ou queda do time do jogador aparece em destaque na decisão e fica marcada na trajetória.
- **Dinheiro:** como no Copero, só aparece o **valor de mercado**, como número de status. Não há salário, e nenhuma decisão é motivada por dinheiro.
- **Estatísticas por split:** partidas, KDA, abates (kills) e assistências.
- **Títulos:** liga (cada split), First Stand, MSI e Worlds. **Prêmios individuais:** MVP do split, seleção do split, MVP das finais e MVP do Worlds.
- **Escopo em fatias**, nesta ordem:
  1. Tier 1 do Brasil (CBLOL)
  2. Tiers 2 e 3 do Brasil e acesso (o mesmo sistema de promoção serve aos dois)
  3. Tiers 1 e 2 da Europa, LCS, LPL e LCK
  4. First Stand, MSI e Worlds
  5. LATAM (só tier 2)
  6. Tiers 1 e 2 da LCP
  7. Card compartilhável e conquistas
- **Fatia 1 (MVP):**

  | Item | Na fatia 1 |
  |---|---|
  | Regiões | Só o CBLOL 2026 (8 times reais, com estrutura, momento e tendência) |
  | Nacionalidade | Fixa em Brasil |
  | Começo | Aos **16 anos**, direto no CBLOL, com 3 ofertas. A regra dos 18 para estrear no tier 1 só entra na fatia 2, junto com academy e tiers 2 e 3 |
  | Modos | Intensa, Normal e Expressa |
  | Decisões | Transferências entre times do CBLOL, ficar, eventos e aposentadoria |
  | Eventos | 23 dos 29 do catálogo ([lista](eventos.md#eventos-da-fatia-1-só-cblol)) |
  | Resultados | Partidas, KDA, abates, assistências, títulos do CBLOL, prêmios do split e valor de mercado |
  | Fim | Resumo da carreira |
  | Telas | Cópia do padrão do Copero: intro → identidade → carreira → resumo ([fluxo](telas.md)) |
  | Pausa e retorno | Fatia 2, junto com os tiers 2 e 3 |
- **Eventos de carreira:** o [catálogo](eventos.md) apresentado foi aprovado como base. O ajuste fino fica para o playtest.

Detalhes de cada sistema em [design-sistemas.md](design-sistemas.md).

## Em aberto

- Ajustes que vierem do playtest (ver [progresso.md](progresso.md), seção "Para revisar").

## Depois

- **Projeto do tier 3:** montar o seu próprio time, ou entrar num time novo, com a missão de subir de tier.
