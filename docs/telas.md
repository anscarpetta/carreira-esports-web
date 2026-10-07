# Fluxo de telas

**Decisão:** na primeira versão, **copiar o padrão do Copero**, só trocando o futebol pelo LoL. Revisamos depois, com o jogo rodando.

Estrutura levantada no código do Copero (out/2026). Quatro fases: **intro → identidade → carreira → resumo**.

## 1. Intro

| Copero | Nosso jogo |
|---|---|
| Imagem de capa, título "Construa sua carreira no futebol" e subtítulo | Título "Construa sua carreira no LoL" e subtítulo no mesmo tom |
| Escolha do modo, em 3 cartões: Intensa, Normal e Expressa | Igual (1 decisão por split / por ano / a cada 2 anos) |
| Botão "Começar carreira" | Igual |
| Seletor de idioma (es, en, pt) | Só pt na fatia 1 |
| Botão de conquistas | Fica para a fatia 7 |

## 2. Identidade ("Passo 1")

| Copero | Nosso jogo |
|---|---|
| Nacionalidade (busca com bandeiras) | Na fatia 1 a nacionalidade é **fixa em Brasil** (o campo aparece, mas travado). A busca chega na fatia 3 |
| Posição (12 opções) | **Rota:** Top, Jungle, Mid, ADC, Suporte |
| Sobrenome, número e pé dominante (cosméticos) | **Nick** (cosmético) |
| Botão "Confirmar identidade" | Igual |

## 3. Carreira (a tela principal)

**Layout:**
- **Desktop:** duas colunas. À esquerda, o cartão do jogador e, embaixo, o painel de decisão. À direita, a trajetória.
- **Celular:** o cartão no topo, a trajetória no meio (com rolagem) e o painel de decisão fixo embaixo.

### Cartão do jogador
- Nick, rota, **OVR**, **valor de mercado**, idade e time atual (com logo), ou "Sem time".
- Totais da carreira: **partidas, KDA, abates e assistências**.

### Painel de decisão
- Título e descrição da decisão. Exemplos: "Oferta inicial", "Janela de transferências", um evento como "Bootcamp na Coreia".
- **Opções em cartões:**
  - Ofertas: "Assinar com {time}" (com logo, força e seta de tendência) e "Ficar no {time}".
  - Eventos: as opções com as **probabilidades visíveis** ("70%: +3 OVR / 30%: tendinite").
- **"Encerrar carreira":** discreto, sempre disponível (decisão nossa; o Copero só oferece aposentadoria em certas situações).
- No fim da carreira, o painel mostra "Sua carreira chegou ao fim" e os botões **Ver resumo** e **Jogar novamente**.

### Trajetória
- Uma linha por período, com split ou ano, logo do time, idade, OVR, estatísticas, títulos e prêmios.
- Marcas especiais: suspenso, reserva, lesionado.
- Enquanto a próxima decisão não é tomada, aparece uma linha pendente ("Escolhendo time…" ou "Decisão de carreira…").

### Revelação depois de cada decisão (o "vício")
1. Se a opção escolhida tem resultado sorteado, há **~2,5 s de suspense** antes do resultado.
2. **A call do Barão na final** ganha uma animação própria (no Copero é o pênalti: "Gol!" ou "Defesa!").
3. Em seguida, os resultados aparecem em sequência, com os tempos do Copero:

| Momento | O que aparece |
|---|---|
| 0,3 s | identidade |
| 0,65 s | nova linha na trajetória |
| 0,85 s | estatísticas |
| 1,15 s | títulos (com comemoração em pop-up) |
| 1,5 s | variação do OVR |
| 2,4 s | fechamento |
| 3,2 s | próxima decisão |

4. Quem ativou "reduzir movimento" no sistema vê tudo de uma vez, sem animação.

## 4. Resumo final

| Copero | Nosso jogo |
|---|---|
| Cartão do jogador, totais, vitrine de títulos e prêmios ("Vitrine vazia" quando não há nenhum) | Igual, com os troféus reais do CBLOL e os prêmios do split |
| Trajetória dos clubes | Igual |
| "Jogar novamente", que já reaproveita a identidade anterior | Igual |
| Card compartilhável (imagem, copiar, salvar) | Fica para a fatia 7 |

## Em todas as telas

- **Aviso de não afiliação** no rodapé. No Copero ele fala dos clubes; no nosso, inclui também "Riot Games does not endorse or sponsor this project".
