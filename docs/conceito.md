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
- **Tempo:** a unidade é o **split** (3 por ano). Modos Intensa (1 decisão por split), Normal (por ano) e Expressa (a cada 2 anos). As transferências acontecem em qualquer janela, mas a frequência cai nesta ordem: 3→1, depois 2→3, depois 1→2.
- **Janelas com 3 cards (playtest, out/2026):** toda janela de transferência mostra 3 opções:
  - **Normal:** 2 times novos + ficar no time atual.
  - **Fim de ciclo de jovem** (mais comum depois de desempenho ruim, na janela 3→1): 3 times novos.
  - **Fim de ciclo de veterano** (28+): 2 times novos + aposentar.
  - Sem time (agente livre ou streamer): 2 times novos + seguir esperando.
  - Fora da pré-temporada, os times de tier 1 se mexem menos (a qualidade das propostas cai).
- **Sucesso sem garantia:** distribuição-alvo de 30% que nunca se firmam, 40% sólidos, 25% craques e 5% lendas. Sem arquétipo no resumo.
- **Evolução (playtest 2, out/2026):** split a split e mais variável.
  - Quem está longe do potencial cresce mais rápido enquanto é jovem (a subida meteórica de um Tatu ou de um duduhh).
  - Jovem titular, inclusive no academy, evolui mais (+25% até os 19); quem não joga evolui menos.
  - 🚀 **Explosão:** jovem titular com espaço para crescer tem 8% de chance por split de um salto de +2 a +5.
  - O teto realista: no Brasil, 90% dos jogadores ficam até OVR 83 (os maiores chegam a 81–84).
- **Aposentadoria:** botão separado, discreto, disponível desde o começo, sem idade fixa. É possível pausar (streamer, agente livre) e voltar.
- **OVR regional:** os maiores jogadores do Brasil chegam a 81–84 no auge (o suficiente para uma boa vaga na LEC ou na LCS). A LCK fica nos 90 altos.
- **Tendência dos times:** mostra o nível *no período*. Existe a categoria rara "Projeto ambicioso", que dá muito certo ou falha. O jogador não carrega o time sozinho, mas melhora o desempenho e muda a tendência.
- **Começo:** ofertas variadas entre academy, tier 2 e tier 3. Só é possível estrear no tier 1 a partir dos 18 anos. A organização pode subir ou descer o jogador entre o academy e o time principal.
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
