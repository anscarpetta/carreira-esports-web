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
