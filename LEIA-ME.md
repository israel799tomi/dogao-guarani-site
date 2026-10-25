# Dogão Guarani — protótipo de pedidos

Abra `index.html` em um navegador ou sirva a pasta `outputs` localmente:

```powershell
python -m http.server 8000 --directory outputs
```

Visite `http://localhost:8000`. O site tem catálogo, busca, filtros, personalização, abertura animada em 180° do hambúrguer, carrinho local, resumo de checkout, faixa promocional com fotografia, fotos reais da loja e mapa. Os dados dos produtos ficam no array `MENU` dentro de `index.html`.

## Imagens e publicação

- Os hambúrgueres do catálogo e do hero usam fotos publicadas no [cardápio oficial](https://app.cardapioweb.com/dogao_guarani). Confirme com a loja a autorização de reutilização dessas fotos no site. Os demais itens mantêm imagens de produto listadas na Rappi.
- As fotos reais da equipe e do trailer são incorporadas diretamente de publicações do [perfil oficial do Dogão Guarani](https://www.instagram.com/dogaoguarani/) via embeds oficiais do Instagram. Confirme com a loja a autorização para reutilização no site. Os embeds dependem de conexão com o Instagram; o navegador pode exibir controles e links próprios do serviço.
- As fotos dos lanches do hero e dos cards Hambúrguer, X-Tudo e X-Duplo vêm do menu oficial. A abertura em 180° mostra as camadas do lanche em animação; as camadas são uma representação gráfica, pois o menu não oferece imagens separadas dos ingredientes.
- O mapa e a rota usam Google Maps. O endereço público exibido é Avenida Waldomiro Lobo, 1543, Guarani, Belo Horizonte, MG; confirme o número com o proprietário antes de publicar.
- O carregamento de fotos e mapa exige internet.

## Antes de publicar

- Os 29 itens, preços e descrições são provisórios e precisam ser confirmados pelo estabelecimento.
- Não há backend. Carrinho e personalizações ficam apenas no `localStorage` do navegador.
- O checkout valida os campos localmente, mas não envia nem confirma pedidos.
- `admin.html` documenta a configuração pendente; não é um painel administrativo funcional e não tem autenticação. Conecte um backend com autenticação, controle de acesso e validação de preços no servidor antes de oferecer administração.
- Telefone, entrega/retirada, formas de pagamento, horários, taxas e prazo precisam ser confirmados. A lista de acréscimos para hambúrgueres foi copiada do grupo “Acréscimos” confirmado no cardápio oficial; permite até 11 opções por lanche. Tamanhos de macarrão seguem pendentes.
- Google Fonts usa DM Sans e Oswald com alternativas locais. Remova o `@import` se preferir evitar requisição externa de fontes.

## Interação principal

Na tela inicial, clique ou toque no hambúrguer para abrir a animação 3D do hambúrguer e revelar as camadas representadas; toque novamente para remontar. No cardápio, abra um hambúrguer para remover ingredientes e inspecionar as camadas com rótulos. As animações são CSS e reduzem movimento conforme `prefers-reduced-motion`.
