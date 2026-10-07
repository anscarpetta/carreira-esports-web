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
