# Design dos sistemas

Para cada sistema: **decidido** (o que já foi fechado com o Angelo), **proposta** (detalhes ainda a calibrar) e **em aberto**. O resumo das decisões fica em [conceito.md](conceito.md).

---

## 1. Passagem do tempo e modos de simulação

**Decidido:**
- A unidade de tempo é o **split**, com **3 por ano em todas as regiões**. Cada região usa os próprios nomes, e cada split leva a um torneio internacional:

  | Split | CBLOL | LCS | LEC | LCK | Internacional |
  |---|---|---|---|---|---|
  | 1 | Cup | Lock-In | Winter | LCK Cup | First Stand |
  | 2 | Split 1 | Spring | Spring | Rodadas 1–2 | MSI |
  | 3 | Split 2 | Summer | Summer | Rodadas 3–5 | Worlds |

- **Modos:**
  - **Intensa:** 1 decisão por split. Uma carreira longa chega a ~30–36 decisões, e tudo bem: raramente alguém vai tão longe, e quem for pode viver as loucuras de se aposentar e voltar.
  - **Normal:** 1 decisão por ano.
  - **Expressa:** 1 decisão a cada 2 anos.
- **Transferências acontecem entre todos os splits**, mas com frequências diferentes conforme a janela:

  | Janela | Frequência |
  |---|---|
  | **3 → 1** (pré-temporada) | a mais comum |
  | **2 → 3** (meio do ano) | intermediária |
  | **1 → 2** | a mais difícil |

**Proposta:** a janela define a chance de chegar uma oferta de fora (algo como 100% / ~50% / ~25%, a calibrar). Quando não há oferta, a decisão do split é outra: um evento, subir ou descer na organização, disputa de vaga.

---

## 2. Sucesso sem garantia

**Decidido:**
- O desfecho não é garantido: a carreira pode ser medíocre, craque ou de "ídolo mediano".
- **Distribuição-alvo**, a conferir com simulação em massa de milhares de carreiras:

  | Resultado | Fração das carreiras |
  |---|---|
  | Nunca firma no tier 1 | **30%** |
  | Profissional sólido | **40%** |
  | Craque | **25%** |
  | Lenda | **5%** |

- **Sem arquétipo ou rótulo no resumo.** Foi considerado desnecessário.

**Proposta (mecanismos):** potencial oculto (o teto), perfil de desenvolvimento oculto (precoce, normal ou tardio), sorte na evolução de cada split e o contexto do time (quem fica no banco ou no academy evolui menos).

---

## 3. Aposentadoria, pausa e retorno

**Decidido:**
- **O botão "Encerrar carreira" existe desde o começo, mas é discreto.** Fica separado das opções de cada decisão.
- Não há idade fixa. O declínio vem do motor: o OVR cai, as ofertas pioram e surgem eventos.
- **Pausar e voltar é possível.** Acontece muito no LoL: o jogador vira streamer, fica sem time, e depois volta (muitas vezes por um projeto do tier 3).

**Proposta:**
- **Agente livre:** um split sem time, à espera de oferta.
- **Pausa como streamer:** você sai do competitivo e, a cada split, pode receber propostas de volta. As propostas ficam menores quanto mais tempo você passa parado, e o OVR cai devagar.
- **"Caixinha" de projeto no tier 3:** montar o seu próprio time, ou entrar num time novo, com a **missão de subir de tier**. É um modo ou desafio à parte (ver "Em aberto").
- **Epílogo no resumo** (o que ele virou depois): é só sabor.

**Em aberto:** o "projeto do tier 3" entra no MVP ou fica para depois?

---

## 4. OVR e força das regiões

**Decidido:**
- Uma escala única de OVR para jogadores e times, mostrando a diferença entre regiões e entre os times de cada região.
- **Referência:** no auge, os maiores jogadores do Brasil ficam em **81–84**. Esse nível daria uma boa vaga na LEC ou na LCS. **A LCK fica nos 90 altos.**

**Proposta (faixas de OVR dos times, a calibrar):**

| Liga | Faixa |
|---|---|
| LCK | 88–97 |
| LPL | 86–95 |
| LEC | 80–92 |
| LCS | 78–88 |
| LCP | 76–86 |
| CBLOL | 72–82 |
| Tier 2 | 62–74 |
| Tier 3 | 50–64 |

- Os internacionais usam a curva do Elo do Global Power Rankings: diferença de força → chance por jogo → séries Bo3 ou Bo5.
- **Teste de sanidade:** o melhor do CBLOL contra o 5º da LEC precisa dar ~35–40% de chance numa série (caso da RED contra a Vitality, na Demacia Cup 2026).

---

## 5. Tendência dos times

**Decidido:**
- **A tendência mostra o nível do time *naquele período*.** Um time "em baixa" não é ruim para sempre: está ruim por enquanto.
- **"Projeto ambicioso" é uma categoria rara** que pode **dar muito certo ou falhar**.
- **O jogador não carrega um time sozinho**, mas melhora o desempenho e **pode mudar a tendência** do time.

**Proposta de modelo:**
- **Força = estrutura da organização + momento do elenco + você.**
  - **Estrutura:** muda devagar, em anos.
  - **Momento:** oscila a cada janela (mais na 3 → 1) e tende a voltar ao nível da estrutura.
  - **Você:** peso de ~20%. Além disso, ser o destaque empurra o momento do time para cima no split seguinte.
- **Projeto ambicioso:** no fim do período, sorteia-se o resultado. Ou o momento dispara, ou o projeto desmorona (o time cai de nível, o elenco é desmontado, a organização pode até sair da liga).
- Os dados históricos estão em [pesquisa-ciclos-e-forca.md](pesquisa-ciclos-e-forca.md): janela de título de 1 a 2 anos e fase ruim de 1 a 3 anos.

---

## 6. Começo da carreira e movimento dentro da organização

**Decidido:**
- **As ofertas iniciais podem variar**, numa mistura aleatória de academies, tier 2 e tier 3.
- **Regra dos menores de 18:** só é possível **estrear no tier 1 (CBLOL ou ligas maiores) a partir dos 18 anos**.
- **Subir e descer dentro da organização:** se o desempenho e o OVR justificarem, o time pode promover ou rebaixar o jogador. Exemplo: na RED Academy, a opção "ficar" vira **"Subir para a RED Canids"**. O caminho inverso, ser mandado de volta ao academy, também existe.

**Em aberto:** quais são os tiers 2 e 3 de cada região e quais times entram neles (pesquisa de dados).
