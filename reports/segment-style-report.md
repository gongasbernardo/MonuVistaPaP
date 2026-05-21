## Relatório: Estilos de `ion-segment` / `ion-segment-button`

Data: 2026-05-21

Objetivo: listar todos os pontos do código onde `ion-segment` e `ion-segment-button` são estilizados, mostrar o trecho atual e recomendações para harmonizar o comportamento visual dos botões/tabs.

---

## Arquivos encontrados

- [src/index.css](src/index.css#L432-L458)

Trecho relevante:

```css
/* Global segment/button color tuning to avoid inconsistent states across the app */
ion-segment {
  --indicator-color: var(--ion-color-primary);
}

ion-segment-button {
  --color: var(--neutral-600);
  --color-checked: var(--ion-color-primary);
}
```

Recomendação: manter as variáveis globais (ok). Adicionar `--background-checked` quando desejar que o botão selecionado use o gradiente da marca, e garantir contraste suficiente.

- [src/pages/Home.css](src/pages/Home.css#L780-L812)

Trecho relevante:

```css
ion-segment ion-segment-button {
  --color: var(--neutral-500);
  --color-checked: white;
  --background-checked: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  --indicator-color: transparent;
  border-radius: var(--radius-sm);
  margin: 0 var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: var(--transition-fast);
}
```

Recomendação: bom — usa `--background-checked` com brand gradient. Garantir que `--color-checked` e `--background-checked` tenham contraste (texto branco sobre o gradiente está OK).

- [src/pages/Community.css](src/pages/Community.css#L80-L104)

Trecho relevante:

```css
ion-segment ion-segment-button {
  --color: var(--neutral-500);
  --color-checked: white;
  --background-checked: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  --indicator-color: transparent;
  border-radius: 8px;
  margin: 0 4px;
  font-weight: 600;
  font-size: 14px;
}
```

Recomendação: consistente com `Home.css`. Mantê-las alinhadas é recomendado.

- [src/pages/Album.css](src/pages/Album.css#L132-L156)

Trecho relevante:

```css
.filter-segment ion-segment-button {
  --color: var(--neutral-500);
  --color-checked: white;
  --background-checked: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  --indicator-color: transparent;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  min-height: 36px;
}
```

Recomendação: OK — segue padrão das outras páginas.

- [src/pages/Groups.css](src/pages/Groups.css#L324-L368)

Trecho relevante:

```css
.groups-segment ion-segment-button {
  --color: var(--neutral-600);
  --color-checked: var(--ion-color-primary);
  --background: transparent;
  border-radius: 12px;
  padding: 6px 14px;
  margin: 0 6px;
  transition: background 0.18s ease, color 0.18s ease, transform 0.12s ease;
}

.groups-segment ion-segment-button[aria-pressed="true"] {
  background: rgba(232, 128, 95, 0.10);
  color: var(--ion-color-primary);
  font-weight: 700;
  transform: translateY(-1px);
}
```

Recomendação: define visual próprio (fundo leve + cor primária). Está consistente com a intenção de destaque suave. Caso queira o mesmo visual 'gradient filled' das outras páginas, substituir `background` por `--background-checked` com o gradiente da marca.

---

## Observações gerais

- As páginas agora usam variáveis globais (`--primary`, `--ion-color-primary`) e `--background-checked` em vários locais — isso é bom para consistência.
- `Groups.css` aplica um comportamento ligeiramente diferente (fundo translúcido + `aria-pressed` styling). Isso é aceitável se o objetivo for uma seleção mais sutil.
- Falta uma verificação visual completa (rodar localmente e inspecionar contraste/hover/active em dispositivos). Recomendo testar em tela móvel e desktop.

## Ações recomendadas

1. Decidir o estilo padrão para `selected` (a) preenchimento com gradiente da marca (`--background-checked`) ou (b) destaque sutil (fundo translúcido + cor primária).  
2. Se escolher (a), atualizar `Groups.css` para usar `--background-checked` e `--color-checked:white` para manter consistência.  
3. Rodar a app localmente e validar estados: `npm run dev` (ou `yarn dev`).  
4. (Opcional) Capturar screenshots dos segmentos de cada página para revisão visual.

---

Gerado automaticamente pelo assistente — se deseja, aplico as mudanças sugeridas automaticamente (ex.: padronizar para preenchimento gradient em todas as páginas) e abro PR local.
