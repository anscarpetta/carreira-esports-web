# Pesquisa: força das regiões, calendário e ciclos dos times

Base para calibrar OVR, splits e a "tendência" dos times. Pesquisa feita em out/2026; as fontes estão no fim do arquivo.

## 1. Calendário de 2026: quantos splits cada região tem

| Região | Estrutura em 2026 |
|---|---|
| CBLOL | **3 splits:** Cup (jan–mar), Split 1 (mar–jun), Split 2 (jul–out) |
| LCS | **3 splits:** Lock-In (jan–mar), Spring (abr–jun), Summer (jul–out) |
| LPL | **3 splits** (desde 2025) |
| LEC | Winter/Versus, Spring e Summer (os títulos de 2026 listados são Spring e Summer) |
| LCK | LCK Cup no início do ano e depois **uma temporada longa em rodadas** (desde 2025) |
| Internacionais | First Stand (~mar), MSI (~jun–jul), Worlds (~out–nov) |

A maioria das ligas já tem **3 etapas por ano, cada uma ligada a um torneio internacional**.

**Tier 2 no Brasil:** o **Circuito Desafiante** voltou em 2025, com academies (Keyd, RED, paiN) e times independentes. Desde 2026, o CBLOL tem **1 vaga de convidado sujeita a acesso e rebaixamento** contra o Desafiante e a Liga Regional Sur.

## 2. Força das regiões: Global Power Rankings (Elo da Riot)

Pontuação dos times no fim do Split 2 de 2026:

| Liga | Times (pontos) |
|---|---|
| LCK | Gen.G 1522 · T1 1484 · HLE 1459 · KT 1390 · DK 1347 |
| LEC | G2 1472 · KC 1379 · KOI 1324 |
| LCS | FlyQuest 1328 |
| CBLOL | FURIA 1215 · RED 1184 · Keyd 1170 · LOUD 1157 · LOS 1140 · **paiN 1137 (3-13)** · Fluxo W7M 1082 · Leviatán 1073 |

A força média por região num snapshot anterior era: LCK 1738 · LPL 1508 · LEC 1339 · LCP 1338 · LTA North 1305 · LTA South 1054.

**Como ler esses números:**
- No Elo, **100 pontos de diferença dão ~36% de chance de vitória por jogo** para o mais fraco. 200 pontos dão ~24%, e 400 pontos, ~9%.
- O melhor time do CBLOL fica **na altura do meio ou da parte de baixo da LEC**. Um time mediano do CBLOL está ~250–350 pontos abaixo de um time médio da LCK.

**Prova real, a Demacia Cup 2026:** a RED Canids (4ª do CBLOL) **venceu a NAVI** (LEC) e **perdeu de 2-0 para a Vitality** (5ª da LEC). É o retrato que você descreveu: o melhor do Brasil disputa de igual para igual com o meio da tabela europeia.

## 3. Ciclos dos times: o que o histórico de títulos mostra

**CBLOL (campeões por split):**
- INTZ: 2015-1, 2016-1, 2016-2 → 2019-1, 2020-2 → depois **sumiu do topo**
- KaBuM: 2014-2 → 2018-1, 2018-2, 2020-1 → **declínio a partir de 2021**
- RED: 2017-1 → 2021-2, 2022-1
- **LOUD: 2022-2, 2023-1, 2023-2, 2024-1 (4 seguidos)** → 2026-Cup
- **paiN: 2013, 2015-2, 2021-1, 2024-2.** Ganha em eras diferentes, mas tem fases ruins longas (2026 Split 2: 3-13)
- Flamengo: vice várias vezes, campeão em 2019-2 → **saiu do LoL**
- LOS: **saiu depois de 2024**, voltou em 2026 como convidada (2 coreanos + núcleo local) e **terminou o Split 2 em 2º (6-1)**

**LEC:**
- Fnatic: 5 de 6 títulos em 2013–15 → 2018 → nenhum desde então
- **G2: 2016–17 (4 seguidos), 2019–20 (4 seguidos), 2023–26 (quase todos)**
- MAD: 2021 (2) → 2023-Spring. Rogue: 2022-Summer

**LCK:**
- SKT/T1: 2013–2019 (várias vezes) → 2022-Spring
- DWG: 2020-Summer, 2021 (3 seguidos)
- **Gen.G: 2022-Summer → 2026 (dominante)**

### Padrões tirados disso
1. **A janela de título dura de 1 a 2 anos (2–4 splits).** As dinastias chegam a ~4 títulos seguidos.
2. **Organizações grandes voltam ao topo em eras diferentes** (G2, T1, paiN, KaBuM): a estrutura fica, os elencos mudam.
3. **Organizações médias costumam ter uma janela só** (RED 2021–22, MAD 2021, Flamengo 2019–20).
4. **Organizações somem e voltam** (Flamengo saiu; INTZ apagou; LOS saiu e voltou forte).
5. **Uma fase ruim dura de 1 a 3 anos.** A virada costuma vir com uma reformulação na pré-temporada, muitas vezes com importados coreanos.

Conclusão para o motor: a força de um time = **estrutura da organização** (muda devagar, em anos) + **momento do elenco** (muda a cada pré-temporada, oscila e tende a voltar ao nível da estrutura).

## Fontes

- [CBLOL — Wikipedia](https://en.wikipedia.org/wiki/Campeonato_Brasileiro_de_League_of_Legends) · [Temporada 2026 do CBLOL](https://en.wikipedia.org/wiki/2026_CBLOL_season)
- [LEC — Wikipedia](https://en.wikipedia.org/wiki/League_of_Legends_EMEA_Championship) · [LCK — Wikipedia](https://en.wikipedia.org/wiki/League_of_Legends_Champions_Korea)
- [LCS 2026](https://en.wikipedia.org/wiki/2026_LCS_season) · [LPL](https://en.wikipedia.org/wiki/League_of_Legends_Pro_League)
- [Global Power Rankings 2026, Split 2 (Liquipedia)](https://liquipedia.net/leagueoflegends/Global_Power_Rankings/2026/Split_2) · [GPR (lolesports)](https://lolesports.com/en-US/gpr)
- [Demacia Cup 2026, rodada 3 (Sheep Esports)](https://www.sheepesports.com/en/articles/lec-and-lpl-split-fortunes-while-lck-climbs-at-demacia-cup-in-round-3/en) · [RED vence a NAVI (Hotspawn)](https://www.hotspawn.com/league-of-legends/news/demacia-cup-day-1-recap)
- [Circuito Desafiante (Leaguepedia)](https://lol.fandom.com/wiki/Circuito_Desafiante)
- [LOS volta ao CBLOL (Esports Insider)](https://esportsinsider.com/2025/12/los-grandes-cblol-return-2026)
