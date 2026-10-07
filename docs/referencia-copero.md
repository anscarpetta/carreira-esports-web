# Referência: Simulador de Carreira (Copero)

Análise do jogo [copero.com.ar/juegos/simulador-carrera](https://copero.com.ar/juegos/simulador-carrera), feita a partir do código publicado (bundle `CareerSimulatorPage`, out/2026). Objetivo: entender **por que vicia** e **o que adaptar** para o LoL.

## 1. Fluxo de uma partida

1. **Identidade:** nacionalidade e posição (as duas afetam o jogo). Sobrenome, número e pé dominante são só cosméticos.
2. **Oferta de base:** 3 clubes aleatórios do seu país (ou da confederação, se o país tiver poucos clubes).
3. **Loop principal**, repetido até a aposentadoria:
   - Uma **decisão**: transferência (2 ofertas + "ficar"), empréstimo, fim de contrato ou evento pessoal.
   - O jogo **simula um período** de 1, 2 ou 3 temporadas, conforme o modo.
   - **Revelação animada** do resultado: trajetória → estatísticas → títulos → OVR (~3 s no total).
4. **Aposentadoria:** aos 40 anos, ou por falta de ofertas (OVR < 40 depois dos 26), ou voluntária (a partir dos 34, quando não há ofertas).
5. **Resumo:** vitrine de títulos e prêmios, imagem compartilhável, conquistas desbloqueadas e "Jogar novamente".

| Modo | Temporadas por decisão | Eventos pessoais por carreira |
|---|---|---|
| Intensa | 1 | 6–7 |
| Normal | 2 | 3–4 |
| Expressa | 3 | 2–3 |

A carreira vai **dos 16 aos ~38 anos**. No modo normal são **~11–12 decisões** por carreira, o que dá poucos minutos de jogo.

## 2. Motor (o que fica escondido)

### OVR: o número que move tudo
- Um único atributo de 40 a 99. Não há atributos separados.
- **Evolução por faixa etária**, com intervalo aleatório a cada 2 anos. No perfil normal: +4 a +14 aos 18, +1 a +8 aos 24, 0 a +3 aos 26, −1 a 0 aos 28–30, −10 a −3 aos 38.
- **Perfis de desenvolvimento ocultos:** precoce (10%), tardio (10%) ou normal (80%). Goleiros têm uma curva própria, mais longa.
- **Quem não joga não evolui.** A partir dos ~24 anos, um reserva ou um jogador de rotação baixa sorteia a evolução duas vezes e fica com o **pior** resultado.

### Papel no time = OVR − força do clube
Cada clube tem uma reputação de −1 a 5, que vira um "OVR base": 52, 58, 68, 75, 80, 84 ou 88.

| Diferença | Papel | Jogos por temporada |
|---|---|---|
| ≥ 0 | Titular | 40–50 |
| −1 a −4 | Rotação alta | 25–39 |
| −5 a −8 | Rotação baixa | 15–24 |
| < −8 | Reserva | 5–14 |

**Esse é o trade-off central do jogo:** um clube grande dá mais chance de títulos, mas você fica no banco e para de evoluir. Um clube pequeno garante minutos, mas não ganha nada. Toda oferta de transferência faz o jogador pesar isso.

### Resultados da temporada
- **Estatísticas** (jogos, gols, assistências) = papel × taxa da posição × força do clube.
- **Títulos** (liga, copa, continental, mundial de clubes): a probabilidade vem da reputação do clube, multiplicada pelo OVR do jogador.
- **Prêmios** (Bola de Ouro, Chuteira de Ouro): a probabilidade depende do OVR, dos títulos e do papel. Só titular tem chance real.
- **Valor de mercado** = curva do OVR × fator de idade. É decorativo, mas dá sensação de status.
- **Acesso e rebaixamento** nas ligas de 2ª e 3ª divisão.
- **Seleção:** convocação e torneios a cada 4 anos (Copa do Mundo, Copa América, etc.).

### Mercado
- O **OVR atual** define de que nível de clube vêm as ofertas: sempre 2 ofertas, mais a opção de ficar.
- Às vezes aparecem ofertas de países vizinhos da mesma confederação, o que cria a sensação de "ser visto lá fora".
- **Empréstimo** para jovens sem espaço, com uma decisão na volta ("retorno com espaço" ou "sem espaço").
- **Fim de ciclo:** a partir dos 26 anos, quem acumula períodos no banco recebe a notícia de que o clube não vai renovar.

### Eventos pessoais (25 tipos)
- São **agendados em idades não consecutivas**, com intervalo mínimo entre eles, e sorteados com pesos.
- São **contextuais:** "Oferta do rival" só aparece para titular de clube grande; "Volta para casa" só depois dos 24 e jogando fora do país.
- **As probabilidades ficam visíveis.** Exemplo: "Aceitar: 70% +3 OVR / 30% −2 OVR". O jogador sente que escolhe o próprio risco.
- Os tipos se dividem em:
  - **Apostas de OVR:** treino extra, treinador pessoal, substância duvidosa, tatuagem.
  - **Moral e escândalo:** manipulação de resultados, "proposta indecente", postagem polêmica de um familiar.
  - **Papel no time:** mudança de posição, disputa pela vaga, promessa da base que chega para disputar seu lugar.
  - **Rumo da carreira:** oferta do rival, crise no clube, ira da torcida, volta para casa, problema fiscal.
  - **Momentos de clímax:** pênalti decisivo numa final (você escolhe esquerda ou direita), jogar lesionado uma final.
  - **Lesão:** 2% de chance em cada evento, no máximo 2 por carreira. As 10 lesões variam de −1 a −10 de OVR.

### Técnico
- **RNG com semente** (xorshift + hash FNV): toda carreira é determinística e reproduzível.
- **Estado imutável:** cada decisão gera um novo estado e um log de eventos. Isso facilita testes e a montagem do resumo final.
- Dados de países, ligas e clubes ficam embutidos num JSON, com reputação doméstica, continental e internacional.
- Interface em três idiomas (es, en, pt).

## 3. Por que vicia

1. **Poucas decisões, todas com peso.** Cerca de 12 escolhas por carreira, e cada uma é um trade-off claro, nunca uma escolha óbvia.
2. **Recompensa variável com revelação.** A animação em etapas transforma o resultado numa expectativa ("ganhei a Champions?").
3. **Sessão curta e replay instantâneo.** Uma carreira cabe numa pausa, e o botão "Jogar novamente" está logo ali.
4. **A história surge dos números.** Ninguém escreve a narrativa: a vitrine e a trajetória contam a história sozinhas.
5. **Conquistas como metas de longo prazo**, inclusive para estilos de jogo "ruins": *Ringless* (nenhum título), *Baldosero* (24 clubes), *Lenda do clube* (um só clube). Cada uma induz um jeito diferente de jogar.
6. **Risco escolhido.** Com as probabilidades à mostra, perder dói, mas a culpa é da sua escolha.
7. **Fantasia com nomes reais.** Você *sabe* o que significa jogar no Real Madrid. O Copero usa nomes reais com um aviso de que não é afiliado aos clubes.
8. **Card compartilhável** para mostrar a carreira e comparar com amigos.

## 4. Primeiro mapeamento para o LoL (rascunho para discussão)

| Copero (futebol) | Equivalente no LoL |
|---|---|
| Posição (12) | Rota (5): Top, Jungle, Mid, ADC, Suporte |
| Nacionalidade / confederação | País / região (BR→CBLOL, KR→LCK, CN→LPL, EU→LEC, NA→LTA) |
| Categoria de base aos 16 | Fila solo / academy aos ~16–17 |
| Carreira dos 16 aos 38 | **Carreira curta:** dos ~16 aos ~28–30, com pico entre 19 e 24 |
| Temporada | Ano competitivo (2 splits + MSI + Worlds) |
| Liga / Copa / Continental / Mundial | Split da liga / MSI / Worlds (talvez First Stand) |
| Bola de Ouro / Chuteira | MVP do split, Seleção do split (All-Pro), MVP das finais, MVP do Worlds |
| Gols / assistências | Abates / KDA / CS (ou só partidas e KDA) |
| Acesso / rebaixamento | Circuito Desafiante e academy (franquias não caem: muda a dinâmica) |
| Seleção / Copa do Mundo | Provavelmente sai (talvez Asian Games para KR/CN) |
| Estrangeiro na liga vizinha | **Importado**: limite de importados por time, bootcamp na Coreia |
| Lesão | Lesão no pulso ou tendinite, burnout |
| Substância misteriosa | Conta compartilhada / elojob, banimento por toxicidade |
| Pênalti decisivo | Call de Barão na final: forçar ou recuar |
| Oferta do rival | Proposta do "super time" da LCK ou da LPL |
| Volta para casa | Voltar ao CBLOL depois de jogar fora |
| Lenda do clube | "Fiel": a carreira inteira num só time (à la Faker) |

Eventos que só existem nos esports: mudança de meta ou patch que favorece ou prejudica sua rota, proposta para virar streamer (dinheiro e fama contra foco), rookie prodígio disputando a vaga, troca de rota, polêmica no Twitter, tilt na fila solo.
