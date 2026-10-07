# Diário de progresso

Registro do desenvolvimento autônomo (a partir de 07/10/2026, enquanto o Angelo dormia). Cada fatia segue o mesmo fluxo: implementa → testa → PR → CI verde → merge → deploy automático.

Jogo no ar: https://anscarpetta.github.io/carreira-esports-web/

---

## Fase 3: esqueleto ✅

- PR #4: Vite + React + TypeScript + Tailwind, CI e deploy no GitHub Pages.
- O GitHub Pages foi ativado no repositório (modo GitHub Actions).

## Fatia 1: CBLOL ✅

### O que dá para jogar
- **Intro → identidade (nick + rota) → carreira → resumo**, copiando o fluxo do Copero.
- Os **3 modos** (Intensa, Normal e Expressa).
- **Carreira no CBLOL** dos 16 anos até a aposentadoria. Ela termina por falta de propostas, pelo botão discreto "Encerrar carreira" ou aos 35 anos.
- **Ofertas** com logo, força, tendência (↑ Em alta … ↓ Em baixa), selo de "Projeto ambicioso" e papel esperado (titular, reserva, banco).
- **Janelas** com frequências diferentes: 3→1 (quase sempre há proposta), 2→3 (às vezes), 1→2 (raro).
- **22 eventos de carreira** com probabilidades visíveis, mais a lesão (sorteio raro) e a saída de uma organização da liga.
- **Revelação animada:** suspense de 2,5 s nos resultados sorteados (animação própria na call do Barão), splits aparecendo um a um, variação do OVR e pop-up de títulos e prêmios.
- **Resumo:** totais, vitrine de títulos e prêmios, times da carreira e tabela split a split.
- **Salvamento automático** no navegador (dá para fechar e continuar depois).

### Como o motor funciona
- **Força dos times:** vem do Global Power Rankings da Riot ao fim do Split 2 de 2026, convertida para OVR (`OVR = 80 + (Elo − 1200) / 20`). Exemplo: FURIA 80,8; paiN 76,9 (começa **em baixa**, como na vida real).
- **Estrutura × momento:** cada organização tem uma estrutura de 0 a 5 que define o seu "nível natural". O momento oscila a cada pré-temporada e tende a voltar a esse nível. Projetos ambiciosos são raros e, um ano depois, ou se consolidam ou desmoronam (podendo até tirar a organização da liga; nesse caso entra uma organização antiga, como KaBuM, INTZ ou Flamengo).
- **Partidas:** mesma escala do Elo (5 de OVR ≈ 36% de chance para o mais fraco). Cada split tem fase de pontos (todos contra todos, MD3) e playoffs (MD5).
- **Jogador:** potencial e perfil (precoce, normal, tardio) ficam ocultos. A evolução depende da idade, e quem não é titular evolui menos a partir dos 20 anos. O jogador pesa 20% na força do time e, sendo destaque, puxa o momento do time para cima.
- **Título só conta** para quem foi titular ou entrou em quadra nos playoffs.

### Calibração (simulação em massa, `npm run simulate`)

| Modo | Não vingam | Sólidos | Craques | Lendas | Aposentadoria | Decisões |
|---|---|---|---|---|---|---|
| Normal | 31% | 41% | 22% | 6% | 27 anos | 13 |
| Intensa | 36% | 39% | 20% | 6% | 27 anos | 36 |
| Expressa | 35% | 39% | 21% | 5% | 27,5 anos | 7 |

Meta combinada: 30 / 40 / 25 / 5. A aposentadoria média aos ~27 anos bate com a pesquisa (média real ~25, carreiras de 6 a 8 anos).

### Testes
- **55 testes:** motor (sorteio, partidas, liga, times, jogador, prêmios, ofertas, eventos, carreira completa e reprodutível) e interface (jogo completo clicando pelos botões, revelação animada, botão de encerrar, salvar e retomar).

### Logos
- `npm run logos` baixa os logos da Leaguepedia (miniaturas de 128 px, em WebP) para `public/assets/teams/`.
- O servidor de imagens da Leaguepedia exige o cabeçalho `Referer` da própria Leaguepedia (proteção contra hotlink). O script manda esse cabeçalho, como um navegador faria. As imagens ficam salvas no repositório; nada é carregado direto de lá.
- Sem logo, o jogo mostra a sigla na cor do time.

### Decisões que tomei sozinho (para revisar)
- A carreira começa em **2027** (temporada seguinte aos dados de 2026).
- Valor de mercado em **reais**.
- **Idade máxima de 35 anos**, como trava de segurança. Na prática, o declínio encerra a carreira antes.
- **Bandeiras em SVG** desenhadas no código, porque o Windows não mostra bandeiras em emoji.
- Um **parâmetro de demonstração** (`?demo=semente&steps=N`) que só existe no servidor de desenvolvimento, para conferir telas no meio da carreira.

## Fatia 2: tiers 2 e 3 do Brasil, acesso, academies e pausa ✅

### O que mudou no jogo
- **Pirâmide brasileira com 3 tiers:**

  | Tier | Liga | Times |
  |---|---|---|
  | 1 | CBLOL | 7 parceiros + 1 vaga de convidado (a LOS em 2026) |
  | 2 | Circuito Desafiante | 10 times de 2026: Estral, KaBuM! Ilha das Lendas, INTZ, 7REX, Ei Nerd, RMD, Team Solid e os academies de Keyd, RED e paiN |
  | 3 | Qualificatória Aberta | Barulhinhos, Marere Invokers, KUMA e RAMPAGE (das qualificatórias de 2026), mais organizações tentando voltar (Flamengo, Liberty, Rensga, Vorax) |

- **Acesso e rebaixamento** em toda pré-temporada:
  - O **convidado do CBLOL** enfrenta o melhor do Desafiante numa MD5 (regra real de 2026).
  - Os **2 piores do Desafiante** trocam de lugar com os **2 melhores da Qualificatória**.
  - **Academies** não sobem para o CBLOL nem caem para o tier 3.
  - **Vagas abertas** (organização que sai) são preenchidas em cascata: sobe o melhor de baixo, e o tier 3 recebe organizações de fora da pirâmide.
- **Primeira proposta** aos 16 anos, misturando academies, Desafiante e Qualificatória.
- **Regra dos 18 anos:** nenhuma proposta, subida ou evento leva ao tier 1 antes dos 18.
- **Subir dentro da organização:** no academy, se o OVR justificar, aparece "Subir para a {time principal}" (sempre na pré-temporada; 50% nas outras janelas).
- **Pausa e retorno:**
  - "Ficar sem time e esperar propostas" (agente livre), sempre que faltam propostas.
  - Evento **"Proposta para virar streamer"**: você sai do competitivo, perde ritmo (−1 OVR por split) e recebe menos propostas para voltar.
- **Evento "De volta ao academy"** para quem está sem jogar no tier 1.
- **Mercado esfria com a idade:** a partir dos 26, as propostas rareiam, e o tier 3 quer jovens. A partir dos 27, cresce a chance de o time não renovar.
- **Notícias da pré-temporada** acima da decisão (quem subiu, quem caiu, projetos ambiciosos, organizações que saíram).
- **Português correto** para ligas femininas ("da Qualificatória Aberta").

### Calibração (modo normal, 4.000 carreiras)
- 31% não se firmam no tier 1 · 42% sólidos · 22% craques · 5% lendas.
- Aposentadoria média aos ~29 anos (dentro da faixa de 28–29 que você citou).
- ~19% das carreiras nunca passam do tier 2, e ~8% passam por uma pausa (no modo Intensa, ~20%).

### Testes: 58
- Novos testes cobrem o tamanho das ligas após acesso e rebaixamento, os academies, a vaga de convidado, a regra dos 18 anos e a pausa com retorno.

### Decisões que tomei sozinho (para revisar)
- O Desafiante tem 2 splits na vida real; aqui virou **3 "Etapas"** (a Riot chama as fases de "etapa"), para encaixar no calendário de 3 splits.
- **Força dos times de tier 2 e 3 estimada** pela campanha de 2026 (esses times não aparecem no ranking da Riot).
- **Flamengo, Liberty, Rensga e Vorax** aparecem no tier 3 como organizações tentando voltar; Netshoes Miners e Isurus ficam de fora, como reservas.
- Sem logo na Leaguepedia: Team Solid, KUMA e RAMPAGE (aparece a sigla na cor do time).
- Saves da fatia 1 não são compatíveis com o motor novo: o jogo começa uma carreira nova.

## Fatia 3: Europa, LCS, LPL e LCK (tiers 1 e 2), nacionalidade e mobilidade ✅

### O que mudou no jogo
- **Escolha de nacionalidade:** Brasil, Coreia do Sul, China, EUA, Canadá e 12 países europeus (incluindo Portugal). A carreira começa nos tiers de base da região:

  | Região | Tier 2 (onde a carreira começa) | Tier 1 |
  |---|---|---|
  | Coreia | LCK CL (os 10 academies: T1 Esports Academy, Gen.G Global Academy, HLE Challengers…) | LCK (10) |
  | China | LDL (academies + RNG; times do Split 3 de 2025) | LPL (14) |
  | Europa | EMEA Masters (12 times: Solary, Galions, KC Blue, KOI Fénix, G2 NORD, Los Heretics…) | LEC (10) |
  | América do Norte | NACL 2026 (NRG, Cupid, Conviction, Dorado e times universitários) | LCS (8) |

- **Força real do tier 1:** todos os 58 times do ranking da Riot de 13/07/2026 (pós-MSI). A escala virou `OVR = 80 + (Elo − 1200) / 22`, para o HLE (97,7) e o BLG (98) caberem abaixo de 99.
  - O caso RED (79,1) × Vitality (81,8) dá ~42% por jogo, coerente com a Demacia Cup.
- **Ligas franqueadas** (LCK, LPL, LEC, LCS e os tiers 2 delas): sem rebaixamento e sem saída de organizações. O acesso e o rebaixamento continuam só no Brasil.
- **Importados:**
  - Um time de fora só contrata o jogador para ser **titular** (ele ocupa uma vaga de importado).
  - A chance segue a **matriz de mobilidade** da pesquisa: coreanos saem bastante (China, CBLOL, LCS); europeus vão para a LCS; chineses quase nunca saem; brasileiros raramente saem (LCS ~1%, Coreia e China ~0,2%).
  - Selo "Vaga de importado" nas ofertas e "Importado" no cartão do jogador.
- **Residência:** 3 anos (9 splits) numa região tornam o jogador residente. Ele deixa de ser importado e passa a receber propostas de todos os tiers daquela região.
- **Visto atrasado (caso Ceos):** na primeira ida para outra região, há 35% de chance de perder o primeiro split.
- **Eventos novos:** "Saudade de casa" (ficar com −5 OVR temporário ou voltar para a sua região) e "Proposta milionária" (coreanos → LPL; europeus e brasileiros → LCS; um time mais rico e mais fraco; +2 ou −2 OVR).
- **Notícias** filtradas pela região em que você joga.
- **Bandeiras** em PNG do flagcdn (domínio público), no lugar dos desenhos em SVG.
- **111 times com logo real.** Academies chineses sem logo próprio (AL Young, WBG Youth) usam o logo do time principal.

### Calibração por nacionalidade (modo normal, 2.000 carreiras cada)

| Nacionalidade | Não firmam no tier 1 | Sólidos | Craques | Lendas | Jogam fora da região |
|---|---|---|---|---|---|
| Brasil | 31% | 42% | 22% | 5% | ~4% (LCS 3%) |
| Coreia | 70% | 12% | 16% | 3% | 22% no CBLOL, 9% na LPL, 10% na LCS |
| China | 81% | 4% | 12% | 3% | <1% |
| França | 63% | 14% | 20% | 3% | ~20% na LCS |
| EUA | 52% | 24% | 22% | 2% | ~8% |

Começar fora do Brasil é **mais difícil de propósito**: LCK e LPL são muito fortes, e o tier 1 tem poucas vagas. É o "modo difícil" natural que a pesquisa sugeria.

### Testes: 62
- Novos testes cobrem: cada região começando nos próprios tiers de base, importado só como titular, residência após 3 anos e chineses quase nunca jogando fora.

### Decisões que tomei sozinho (para revisar)
- **LDL 2026:** não achei a temporada de 2026 nas wikis, então usei os times do Split 3 de 2025.
- **EMEA Masters como tier 2 europeu**, com os 12 melhores da edição de verão de 2026. Na vida real são ligas nacionais (LFL, Prime League etc.) que classificam para a EMEA Masters.
- **Nomes dos splits:** LCK Cup / Road to MSI / Season; LEC Versus / Spring / Summer; LCS Lock-In / Spring / Summer; LPL Split 1–3; NACL Kickoff / Spring / Summer.
- **Idade mínima de 18 anos no tier 1** para todas as regiões (na vida real a LCK aceita 17).
- O jogo diferencia a vaga de importado pelo papel (só titular), sem controlar o elenco inteiro de cada time.

## Fatia 4: First Stand, MSI e Worlds ✅

### O que mudou no jogo
- **Três torneios internacionais por ano:**

  | Torneio | Quando | Vagas | Formato |
  |---|---|---|---|
  | First Stand | depois do split 1 | 1 por região (LCK, LPL, LEC, LCS, CBLOL) | todos contra todos (MD3) e final (MD5) |
  | MSI | depois do split 2 | LCK 2, LPL 2, LEC 2, LCS 2, CBLOL 1 | todos contra todos (MD3) e playoffs com 4 (MD5) |
  | Worlds | depois do split 3 | LCK 4, LPL 4, LEC 4, LCS 3, CBLOL 1 (16 times) | fase suíça (3 vitórias classificam, 3 derrotas eliminam) e mata-mata com 8 (MD5) |

- **Classificação:** na liga do jogador vale a colocação real do split; nas outras, a força do time (com um pouco de sorte).
- **Campanha na trajetória:** "🌍 MSI 2032: Semifinal · 19j · KDA 4,1", com 🏆 quando é campeão e pop-up 🌍.
- **Títulos internacionais e MVP da final** entram na vitrine (Worlds e MSI primeiro).
- **Notícias** com os campeões de cada torneio, mesmo quando você não está lá ("T1 é campeã do Worlds 2032").
- **Evento "Liga ou internacional?"** (era o 10 do catálogo): priorizar a liga (+1,5 de força na liga, −3 nos internacionais) ou o contrário.
- **Correção:** o craque do tier 1 deixou de ser tratado como "bom demais" pelos times da própria liga. Antes, um jogador de OVR 88 do CBLOL só recebia propostas de saída do tier 2 e 3.

### Milagres "quase zero, nunca zero"
- Num teste com 500 Worlds simulados, o CBLOL não foi campeão nenhuma vez.
- Em 1.500 carreiras brasileiras simuladas: ~1,75 internacionais disputados por carreira e nenhum título. Coreanos e chineses ganham MSI e Worlds de vez em quando.

### Testes: 65
- Novos testes cobrem: o Worlds com 16 classificados e colocações completas, o CBLOL quase nunca campeão, e internacionais só para quem se classificou, sempre no torneio certo para o split.

### Decisões que tomei sozinho (para revisar)
- **Worlds com 16 vagas** (a LEC ficou com 4 para fechar a conta). Quando a LCP entrar (fatia 6), as vagas serão redistribuídas.
- **First Stand com 1 vaga por região** (regra de 2026 para LCS e CBLOL, estendida às outras).

## Fatia 5: LATAM (tier 2) ✅

### O que mudou no jogo
- **Liga Regional Sur** (9z, Docta, Malvinas Gaming, Golden Lions, Maze, Seven Dark, Volticons e ZEN) e **Liga Regional Norte** (LYON Academy, SDM Tigres, Kits, Fuego, NCG, Polar Squad, Zeu5 e 3V), com os times do Split 2 de 2026.
- **Nacionalidades latino-americanas:** Argentina, Chile, México, Colômbia e Peru.
- **Dupla residência (regra real de 2026):** até 2027, latino-americanos jogam CBLOL e LCS (e os tiers de baixo dessas regiões) sem ocupar vaga de importado. A partir de 2028, ficam residentes só na região (Brasil ou América do Norte) onde mais jogaram.
- **Acesso ao CBLOL pela Liga Regional Sur:** o desafiante da vaga de convidado sai do Desafiante ou da Liga Regional Sur (o melhor dos dois). O convidado rebaixado vai para a liga de onde veio o desafiante.
- A Liga Regional Norte é fechada (sem acesso), porque a LCS é franqueada.

### Calibração (argentinos, modo normal)
- 40% não se firmam no tier 1 · 35% sólidos · 22% craques · 4% lendas.
- 82% das carreiras passam pelo Brasil e 23% pela LCS, reflexo da dupla residência (como os argentinos que hoje jogam o CBLOL).

### Testes: 66
- Novo teste da dupla residência: não é importado no CBLOL nem na LCS até 2027, é importado na LCK, e depois de 2028 fica só na região onde mais jogou.

### Decisões que tomei sozinho (para revisar)
- **Nomes dos splits da LATAM:** Apertura, Split 1 e Split 2 (Apertura é um nome comum na região).
- **Força dos times da LATAM estimada** (na faixa do Desafiante).
- **Isurus e WAP Esports** ficam como reservas da Liga Regional Sur.

## Fatia 6: LCP (Pacífico, tiers 1 e 2) ✅

### O que mudou no jogo
- **LCP (tier 1):** os 8 times do ranking da Riot de 13/07/2026 (Team Secret Whales, CTBC Flying Oyster, GAM, Deep Cross Gaming, MVK, SoftBank HAWKS, Ground Zero e DetonatioN FocusMe).
- **Tier 2 com as ligas nacionais de 2026:**
  - **VCS (Vietnã):** MVK Academy, Saigon Dino, Cybercore, 9Gaming, Ngựa Hí e Saigon Warriors.
  - **LJL (Japão):** DFM Academy, FENNEL, Rising Gaming, L Guide, RAYN Clocks, New Meta, Arneb e Uwinks.
  - **PCS (Taiwan, Hong Kong e Oceania):** CFO Academy, Frank, GZ Academy, SillySilly, EWH, Reignfall, RogerSaMa e Sponge.
- **Ligas nacionais:** um jogador de outro país da região (por exemplo, um japonês na VCS) só entra como titular, com chance reduzida.
- **Vagas de convidado na LCP:** os 5 convidados enfrentam os melhores das ligas nacionais na pré-temporada.
- **Nacionalidades:** Vietnã, Taiwan, Japão, Hong Kong e Austrália.
- **Mobilidade:** taiwaneses e vietnamitas às vezes vão para a LPL (como SofM e Karsa) e quase nunca para a LCK (só o LazyFeel, em 2025). Coreanos também vão para a LCP.
- **Internacionais com a LCP:**

  | Torneio | Vagas da LCP | Total de times |
  |---|---|---|
  | First Stand | 1 | 6 |
  | MSI | 2 | 11 |
  | Worlds | 2 | 17 (a LEC voltou para 3 vagas) |

- **155 times com logo real.**

### Calibração (vietnamitas e japoneses, modo normal)
- ~41% não se firmam no tier 1 · 35% sólidos · 21% craques · 3% lendas.
- ~3% das carreiras vão para a LPL e ~3% para a LCS.

### Testes: 66
- Os testes de região agora incluem Vietnã, Japão e Taiwan, e o Worlds tem 17 classificados.

## Fatia 7: card compartilhável e conquistas ✅

### Card compartilhável
- No resumo, uma imagem de **1080 × 1350** (formato de post) com nick, bandeira, rota, anos, OVR máximo, títulos, jogos, KDA, vitrine, prêmios e os logos dos times, com o link do jogo no rodapé.
- **Botões:** Compartilhar (menu nativo do celular, com a imagem), Copiar imagem, Salvar imagem e Copiar link do jogo.

### Conquistas (18)

| Conquista | Como desbloquear |
|---|---|
| 🌍 Campeão mundial | Ganhar o Worlds |
| 🇧🇷 O impossível | Ganhar o Worlds com um time do CBLOL |
| 💎 Grand Slam | Ganhar First Stand, MSI e Worlds na mesma carreira |
| 👑 Ano de ouro | Ganhar a liga, o MSI e o Worlds no mesmo ano |
| 🏆 Rei do Brasil | Ganhar 5 títulos do CBLOL |
| 🛡️ Lenda de um time só | Jogar todo o tier 1 por um só time (4+ anos) e ganhar a liga e um internacional |
| 🪜 Do tier 3 ao topo | Começar no tier 3 e ganhar uma liga de tier 1 |
| ✈️ Rota do Ceos | Sendo brasileiro, jogar um tier 1 fora do Brasil |
| 🇰🇷 Primeiro brasileiro na LCK | Sendo brasileiro, jogar a LCK |
| 🧭 Andarilho | Jogar em 3 regiões |
| 🧳 Mala de viagem | Jogar por 8 times |
| ⭐ Máquina de MVP | Ser MVP de 5 splits |
| 🗡️ Mata-gigantes | Ganhar MSI ou Worlds com um time de estrutura pequena |
| 🌟 Prodígio | Ser titular no tier 1 aos 18 anos |
| 🧓 Veterano | Jogar até os 30 anos |
| 🎥 A volta do streamer | Largar o competitivo para fazer lives e voltar |
| 💍 Ringless | Ser titular no tier 1 por 3 anos sem nenhum título |
| 📦 Produto de exportação | Ganhar uma liga de tier 1 fora da sua região |

- Ficam salvas no navegador e valem para todas as carreiras.
- Botão "🏅 Conquistas (n/18)" na intro e no resumo, com filtro (todas, concluídas, pendentes).
- Ao abrir o resumo, as conquistas novas aparecem em pop-up.

### Outros ajustes
- A vitrine do resumo agrupa os prêmios por tipo e liga ("9× Seleção do Circuito Desafiante"), em vez de split a split.

### Testes: 71
- Novos testes cobrem as conquistas (O impossível, Rota do Ceos, Ringless e carreiras simuladas), e o teste do jogo completo agora confere o painel de compartilhamento e a lista de conquistas.

## Revisão final ✅

- **Teste de estresse:** 3.000 carreiras com escolhas aleatórias, em todas as 28 nacionalidades e nos 3 modos (74 mil decisões). Achou 1 bug: um jogador de 17 anos ia junto quando o time do tier 2 subia para o tier 1 e jogava antes dos 18. Corrigido: ele fica no elenco, mas não entra em quadra até os 18. Depois disso, zero erros. Uma versão com 200 carreiras ficou na suíte de testes.
- **Versão do save** passou para 3: carreiras salvas em versões anteriores do motor recomeçam, em vez de quebrar.
- **Total: 72 testes.**

---

## Para revisar quando você acordar

1. **Jogue** em https://anscarpetta.github.io/carreira-esports-web/, de preferência uma carreira no modo Intensa com o Brasil e outra com a Coreia.
2. **Calibração:** a sensação de "sem garantia" está boa? Hoje (Brasil, modo normal) são 30% que não vingam, 43% sólidos, 22% craques e 4% lendas, com aposentadoria média aos 29 anos. Coreia e China são bem mais difíceis.
3. **Decisões que tomei sozinho**, listadas no fim de cada fatia acima. As principais:
   - O Desafiante tem 3 "Etapas".
   - A EMEA Masters é o tier 2 europeu.
   - A LDL usa os times de 2025.
   - Idade mínima de 18 anos em todas as regiões.
   - Worlds com 17 times.
   - Valor de mercado em reais.
4. **Imagens:** os logos vêm da Leaguepedia (o download manda o cabeçalho `Referer` da própria Leaguepedia, como um navegador) e as bandeiras, do flagcdn (domínio público). Tudo fica no repositório e pode ser trocado.
5. **O que ficou para depois:** o "projeto do tier 3" (montar ou entrar num time e subi-lo de tier).

---

## Playtest 1 (out/2026): janelas e acesso

### O que o Angelo encontrou
1. Várias janelas só tinham a opção de ficar no time.
2. Estava no CBLOL com a 9z, ganhou o último split e foi parar no Circuito Desafiante.

### Por que o caso da 9z aconteceu
- A 9z, vinda da Liga Regional Sur, ocupava a vaga de convidado do CBLOL. Na pré-temporada, o convidado sempre disputava uma MD5 contra o melhor do Desafiante ou da LRS, **sem contar a campanha** (nem o título) e **sem contar o jogador** na força do time.
- Perdendo, o convidado ia para a liga **de onde veio o desafiante** (o Desafiante), e não para a liga de origem.
- O aviso era só uma linha nas notícias.

### O que mudou
- **Janelas sempre com 3 cards** (regras no [conceito.md](conceito.md)). As propostas agora são garantidas: se faltar time interessado, entram os times onde o jogador mais faz sentido.
- **Fim de ciclo mais comum** com desempenho ruim: 3 splits seguidos fora da equipe titular dão 60% de chance; 6 splits, 100%.
- **Convidado com boa campanha mantém a vaga**, a série conta a sua força em quadra, e o rebaixado volta para a liga de origem.
- **Quem sobe é escolhido pela campanha:** a mediana de quem sobe do Desafiante para o CBLOL é ~2º lugar (antes, um 10º chegou a subir por causa de um projeto ambicioso).
- **Ligas com time a mais** (quando o convidado volta para a liga de origem e o desafiante veio de outra) rebaixam o pior time, para manter o tamanho das ligas.
- **Aviso em destaque** na decisão ("▲ A Team Solid subiu para o CBLOL!", "▼ … caiu para …") e **marca na trajetória**.
- Versão do save 4.

### Calibração
- Brasil, modo normal: 30% não vingam · 42% sólidos · 23% craques · 5% lendas · aposentadoria ~29.
- Com propostas garantidas, a carreira só acaba quando o jogador decide (card "Aposentar-se" no fim de ciclo do veterano ou botão discreto) ou aos 35. Na simulação, o jogador automático se aposenta como alguém de verdade faria: sem vaga de titular depois dos 28, ou fora do tier 1 depois dos 30.

### Testes: 75
- Novos testes cobrem: toda janela com 3 cards nas combinações certas, a convidada campeã mantendo a vaga, e a convidada com campanha ruim voltando para a Liga Regional Sur. O teste de estresse com 3.000 carreiras roda sem erros.

---

## Playtest 2 (out/2026): eventos e evolução

### O que o Angelo pediu
1. Opções em todos os eventos ("Criticou o coach na live" só tinha "Pedir desculpas").
2. Mais eventos para subir o OVR.
3. A subida meteórica dos craques (duduhh, Tatu: titulares em times grandes aos 18). A evolução estava estática demais; ser titular no academy deveria acelerar.
4. O evento do importado coreano não faz sentido no academy.

### O que mudou
- **Eventos:** detalhes em [eventos.md](eventos.md#playtest-2-out2026). Todo evento tem pelo menos 2 opções (os testes verificam o catálogo e todas as decisões das carreiras de estresse). Há 3 eventos novos de evolução, treinos repetíveis e quase o dobro de eventos por carreira.
- **Evolução:** novo modelo split a split (ver [conceito.md](conceito.md)). Distância do potencial, minutos jogados e explosões 🚀 (com pop-up e marca na trajetória).
- **Forma por split:** cada time varia um pouco de split para split, então até o favorito tem split ruim.
- **Dinastias mais curtas:** um time muito acima do nível natural perde peças na pré-temporada, e o efeito "projeto em volta de você" ficou mais fraco.

### Calibração (Brasil, 3.000 carreiras)

| Modo | Não vingam | Sólidos | Craques | Lendas | Titular no tier 1 aos 18 |
|---|---|---|---|---|---|
| Normal | 33% | 37% | 24% | 6% | 18% |
| Intensa | 28% | 37% | 26% | 9% | 54% (há janela a cada split) |
| Expressa | 40% | 33% | 23% | 5% | 17% |

- Aposentadoria média aos ~29 anos. 90% dos jogadores ficam até OVR 83.
- ~0,4 explosão por carreira.

### Testes: 78
- Novos testes cobrem: todo evento com 2+ opções, jovem titular evoluindo mais que jovem no banco, prodígio crescendo ~+10 por ano, frequência das explosões e o potencial como teto. O teste de estresse com 3.000 carreiras roda sem erros e sem nenhuma decisão de opção única.

---

## Playtest 3 (out/2026): titular no tier 1 e janela da pré-temporada

### O que o Angelo pediu
1. No tier 1 não faz sentido um reserva que joga de vez em quando: ou o jogador vai para ser titular, ou vai como titular e depois é rebaixado para o academy daquele time.
2. As janelas da pré-temporada (3→1) estavam aparecendo pouco.

### Por que a janela sumia
Com mais eventos por carreira (playtest 2), quando um evento caía na pré-temporada ele **substituía** a janela de transferências. No modo Normal só existe a janela 3→1, então muitos anos passavam sem janela.

### O que mudou
- **Tier 1 só com titulares** (regras em [conceito.md](conceito.md)), com a decisão "Rebaixado para o academy" (3 cards: descer para o academy + 2 times).
- **Evento + janela:** na pré-temporada, o evento vem primeiro e a janela aparece logo depois, sem simular splits no meio.
- **Perder espaço por evento** dura só o próximo split.
- **Régua de titular** um pouco mais exigente (até 2 pontos abaixo da força do time).
- **Subida meteórica para quem tem perfil precoce:** no perfil normal e no tardio, o crescimento aos 16–17 ficou um pouco menor.

### Calibração (Brasil, 3.000 carreiras)

| Modo | Não vingam | Sólidos | Craques | Lendas | Titular no tier 1 aos 18 |
|---|---|---|---|---|---|
| Normal | 31% | 40% | 23% | 6% | 25% |
| Intensa | 29% | 40% | 25% | 7% | 47% |
| Expressa | 36% | 37% | 22% | 4% | 24% |

Aposentadoria média aos ~29 anos.

### Testes: 82
- Novos testes cobrem: nenhum reserva jogando no tier 1, propostas de tier 1 só para titular, evento da pré-temporada seguido da janela, e a decisão de rebaixamento com o academy do próprio time. O teste de estresse com 3.000 carreiras roda sem erros.

### Ajustes no mesmo PR (feedback durante o playtest 3)
- **"De volta ao academy" depois de ir ao Worlds:** a Gen.G se reforçou na pré-temporada e o titular de OVR 89 ficou "abaixo da régua". Agora existe o **titular estabelecido**: quem foi titular do time no split anterior só perde a vaga se ficar mais de 5 pontos abaixo da força do time.
- **Menos lesões:** a chance passou a ser por split jogado (0,7%), então dá ~0,2 lesão por carreira em qualquer modo. Antes era 4% por decisão, até ~1,4 por carreira no Intensa. A tendinite da maratona de solo queue caiu de 30% para 20%.
- **Calibração (normal):** 29% não vingam · 43% sólidos · 20% craques · 7% lendas. As lendas a mais vêm de títulos: o titular estabelecido fica mais tempo nos times grandes.
- **83 testes.**

---

## Redesign 1 (out/2026): identidade visual no estilo do Copero

- **Fundo em 3 camadas:** #09090B (fundo), #101014 (caixas), #17171C (cartões dentro das caixas).
- **Selo de OVR colorido** (número branco na caixinha), na escala laranja → amarelo → verde → verde forte → azul → roxo:

  | OVR | Cor |
  |---|---|
  | até 59 | laranja |
  | 60–69 | amarelo |
  | 70–76 | verde |
  | 77–82 | verde forte |
  | 83–89 | azul |
  | 90+ | roxo |

  Aparece no cartão do jogador, na trajetória, no resumo e no card compartilhável.
- **Cor do time:** cards de proposta e linhas da trajetória com a cor do time em baixa opacidade; cartão do jogador com a cor e o logo do time ao fundo.
- **Botões em pílula:** branco para a ação principal, contorno para a secundária.
- **Tela de identidade:** um painel só, em 3 colunas (empilhadas no celular):
  - **Identidade:** prévia do cartão e o campo de nick.
  - **Nacionalidade:** busca (sem acento) e lista rolável com bandeiras.
  - **Rota:** mapa de Summoner's Rift com as 5 rotas.
- **Bibliotecas:** só a `lucide-react` (ícones do ecossistema shadcn/21st.dev). O resto é Tailwind.

## Redesign 2 (out/2026): tela de carreira como a do Copero

- **Trajetória em tabela por idade:** uma faixa por idade (16 a 30, ou além disso se a carreira for mais longa), na cor do time daquela idade. As idades futuras aparecem apagadas.
  - Cada split vira uma linha com time, split, função, colocação, OVR (com a variação), jogos e KDA.
  - As tags (🏆 campeão, ⭐ prêmios, 🌍 internacional, 🚀 explosão, ▲/▼ acesso) quebram a linha no celular em vez de serem cortadas.
  - A linha "Escolhendo o próximo passo…" mostra a idade e o OVR atuais enquanto a decisão está em aberto.
- **Propostas em grade:** cards verticais em 2 colunas, com o verbo ("Assinar com", "Ficar na", "Subir para"…), o nome, o logo grande, a liga e o tier, a força com a tendência e os selos. Com um número ímpar de cards, o último fica centralizado.
- **Vitrine de títulos** no cartão do jogador, com os títulos agrupados e os internacionais primeiro (ex.: "🏆 2× CBLOL").

## Redesign 3 (out/2026): efeitos

Inspirados em componentes do 21st.dev (Magic UI e Motion Primitives, licença MIT), adaptados ao jogo. Bibliotecas novas: `motion` (animações com mola) e `canvas-confetti`.

| Efeito | Onde |
|---|---|
| **Contador de OVR** | O OVR do cartão conta até o novo valor depois de cada decisão e dá um pulo quando muda de faixa de cor |
| **Confete** | No fim da revelação com título: pouco na liga (na cor do time), mais no First Stand e no MSI, e canhões dourados dos dois lados no Worlds |
| **Borda com brilho** | Linhas de título na trajetória (dourada) e card escolhido (branca) |
| **Holofote** | Brilho na cor do time que segue o mouse nos cards de proposta |
| **Lista animada** | As linhas novas da trajetória entram deslizando com mola |
| **Cartão 3D** | Cartão do jogador e card de compartilhar inclinam com o mouse, com reflexo de luz |
| **Brilhos** | "Campeão mundial" no resumo e conquistas lendárias concluídas |

Tudo respeita "reduzir movimento" do sistema: sem animação, sem confete e sem inclinação.
