# Pesquisa: mobilidade realista entre regiões

Base para calibrar o motor: quem vai para onde, com que frequência e por quê. Pesquisa feita em out/2026; as fontes estão no fim do arquivo.

## Estrutura em 2026

- **A LTA acabou.** Ela durou só 2025: juntou as Américas, recebeu críticas e teve audiência fraca. Em 2026 **LCS e CBLOL voltaram** a ser ligas separadas.
- **Vagas internacionais em 2026:**
  - LCS: 1 no First Stand, 2 no MSI e 3 no Worlds.
  - CBLOL: 1 no First Stand, 1 no MSI e 1 no Worlds.
- **LCP** (Pacífico: Taiwan, Vietnã, Japão), criada em 2025. A Team Secret Whales (VN) venceu os três splits de 2026.

## Regras de importados e residência

| Liga | Regra |
|---|---|
| LCS e CBLOL (2026) | Mínimo de 3 residentes e **máximo de 2 importados** entre os titulares. A residência "Américas" acabou: quem jogou a LTA em 2025 virou residente da liga em que jogou. **Jogadores LATAM (exceto Brasil) têm dupla residência** em 2026–27 e precisam escolher uma a partir de 2028 |
| LPL | No máximo 2 não residentes entre os titulares. Na prática, as vagas vão para coreanos |
| LEC | Liga EMEA (Europa, CEI, Turquia, MENA). Limite exato de importados não confirmado nesta pesquisa (provavelmente segue o padrão de 2) |
| ERLs (Europa) | O status LTR deixou de existir em 2026: qualquer europeu joga em qualquer liga regional europeia |
| LCK | Sem limite formal relevante, mas **teve um único estrangeiro na história**: LazyFeel (Vietnã, DRX), que estreou em 2025 como substituto |
| Idade mínima | LEC 18 anos (desde 2024); LCS e outras ligas, historicamente 17 |

## Fluxos reais (matriz qualitativa)

| Origem ↓ / Destino → | LCK | LPL | LEC | LCS | CBLOL | LCP |
|---|---|---|---|---|---|---|
| **Coreia** | casa | **comum** (salários altos; "êxodo" de 2014–15) | raro hoje (comum em 2014–16) | ocasional (veteranos: CoreJJ, Huni, Impact) | **comum** (1–2 por time: Peach, BAO, YoungJae, Bull, Zest, Feisty em 2026) | ocasional |
| **China** | ~0 | casa | ~0 | ~0 | ~0 | ~0 |
| **Europa** | ~0 | ~0 | casa | **fluxo histórico por dinheiro** (Bjergsen, Perkz, Zven, Broxah, Kobbe) | ~0 | ~0 |
| **América do Norte** | ~0 | ~0 | caso isolado (Jojopyun) | casa | ~0 | ~0 |
| **Brasil** | **nunca aconteceu** | nunca | ~0 (Bwipo é belga-brasileiro e cresceu na Europa) | **muito raro**: o **Ceos** foi o 1º brasileiro num tier 1 fora do Brasil | casa | ~0 |
| **LATAM** | ~0 | ~0 | ~0 | possível como residente até 2027 | possível como residente até 2027 | ~0 |
| **Vietnã / Taiwan** | 1 caso (LazyFeel) | ocasional (taiwaneses e vietnamitas já jogaram na LPL) | ~0 | ~0 | ~0 | casa |

### O caso Ceos: um roteiro pronto de eventos
- Saiu da KaBuM para a Shopify Rebellion (LTA North) no fim de 2024, numa transferência de **quase R$ 1 milhão**.
- **Problemas de visto** o deixaram de fora do primeiro split; o Zeyzal entrou como substituto emergencial.
- Com ele titular, o time melhorou: dois 3º lugares seguidos, perto de ir a um torneio internacional.
- Em 2026 **voltou ao Brasil por saudade de casa** e foi para a paiN.

### Por que os fluxos são assim
- **Dinheiro:** LPL e LCS pagam mais, o que atrai coreanos e europeus. Quem sai da Europa para os EUA "troca vitórias por dinheiro".
- **Nível:** ninguém "desce" de LCK ou LPL para o Brasil no auge. Os coreanos que vêm para o CBLOL costumam ser reservas, jogadores de academy ou veteranos.
- **Limite de importados:** um estrangeiro precisa ser *muito* melhor que um local para ocupar uma das 2 vagas.
- **Idioma e cultura:** a China é fechada, e a LCK quase não abre vagas.
- **Visto e saudade de casa:** são barreiras reais, como mostrou o caso Ceos.

## Idade e carreira

- O LoL tem o elenco mais jovem entre os grandes esports, com **média de 21,2 anos**.
- A estreia costuma acontecer entre **16 e 18 anos** (a idade mínima de cada liga também limita isso).
- A **aposentadoria média é por volta dos 25 anos**, e uma carreira dura de **6 a 8 anos**. Alguns ficam bem mais (Faker).
- **Comparação:** no futebol, a aposentadoria fica perto dos 35. A carreira aqui é ~10 anos mais curta.

## Implicações para o design (proposta)

1. **Ofertas por região** = matriz de fluxo × OVR relativo ao nível da liga × vagas de importado. Uma oferta de fora exige um OVR bem acima do que bastaria para um jogador local.
2. **Residência como mecânica:** depois de alguns anos fora, você deixa de contar como importado, e isso abre mais portas.
3. **Realismo com milagres raros:** brasileiro na LCK ou time do CBLOL campeão do Worlds ficam *quase* em zero, mas nunca exatamente zero. Quando acontecem, viram **conquistas lendárias**, como o "Da periferia" do Copero.
4. **A nacionalidade vira dificuldade:** começar coreano é o "modo fácil" para ganhar títulos; começar brasileiro é o "modo difícil". Ninguém precisa explicar isso ao jogador: o próprio motor mostra.
5. **Eventos tirados de casos reais:** visto atrasado, saudade de casa, "dinheiro na LCS × títulos na LEC", importado coreano disputando sua vaga.

## Fontes

- [LCS e CBLOL voltam em 2026 (lolesports)](https://lolesports.com/en-US/news/lcs-and-cblol-return) · [esports.gg](https://esports.gg/news/league-of-legends/lcs-cblol-formats-2026-season/)
- [Regras de residência CBLOL/LCS 2026 (Esports Radar)](https://esportsradar.gg/cblol-and-lcs-announce-updated-residency-rules-for-2026/) · [LCS no X](https://x.com/LCSOfficial/status/1990530509123039441)
- [Fim do LTR nas ERLs (Sheep Esports)](https://www.sheepesports.com/en/articles/sources-ltr-status-removed-from-erls-in-2026/en)
- [Elencos LPL 2026 (Esports Insider)](https://esportsinsider.com/2025/12/every-confirmed-lpl-league-of-legends-roster-2026)
- [LazyFeel, 1º estrangeiro na LCK (esports.gg)](https://esports.gg/news/league-of-legends/drx-lazyfeel-debut-in-2025-lck-cup/)
- [Ceos na Shopify Rebellion (Sheep Esports)](https://www.sheepesports.com/articles/sources-ceos-reaches-verbal-agreement-with-shopify-rebellion/en) · [saída do Ceos (rft.gg)](https://rft.gg/news/shopify-rebellion-departure-support-ceos)
- [Coreanos na LEC (Jaxon)](https://www.jaxon.gg/these-are-the-countries-with-the-most-representatives-in-lec-history/) · [êxodo coreano (ESPN)](https://www.espn.com/esports/story/_/id/26849773/kt-rolster-pray-signing-latest-indication-lck-talent-erosion)
- [Europeus indo para a LCS (Mein-MMO)](https://mein-mmo.de/en/lol-grabbz-spieler-usa-wechseln-meinung,448448) · [Jojopyun na LEC (esports.gg)](https://esports.gg/news/league-of-legends/jojopyun-reportedly-signs-with-mdk-joins-lec)
- [Elencos do CBLOL 2026 (Leaguepedia)](https://lol.fandom.com/wiki/CBLOL/2026_Season/Cup/Team_Rosters)
- [Idade mínima de 18 na LEC (Dot Esports)](https://dotesports.com/league-of-legends/news/lec-raises-minimum-player-age-to-18-for-2024-season) · [Idade e desempenho (Inven Global)](https://www.invenglobal.com/articles/17689/whats-the-relation-between-age-and-performance-in-esports) · [Aposentadoria precoce (BNN)](https://bnn.ca/business-of-sports/looking-for-an-early-retirement-try-competitive-league-of-legends-1.2032576)
- [Política de conteúdo de fã da Riot](https://www.riotgames.com/en/legal)
