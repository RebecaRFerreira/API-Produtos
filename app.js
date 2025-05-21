document.addEventListener("DOMContentLoaded", () => { // Quer dizer que o código JS só vai ser executado depoooiss q todo o conteudo html estiver carregado no navegador
    const tabelaBody = document.querySelector("table tbody"); //armazena o elemento <tbody> do htnml na variavel
    const formulario = document.forms["tabela"]; //armazena o forms da tabela na variavel
    let produtoEmEdicao = null;

    // Função para adicionar produto na tabela-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function adicionarLinha(produto) {
        const linha = document.createElement("tr"); //cria um elemento <tr> (uma linha da tabela)

        linha.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.title}</td>
      <td>${produto.description}</td>
      <td>R$ ${produto.price.toFixed(2)}</td>
      <td>${produto.category.name || "Categoria padrão"}</td>
      <td><img src="${produto.images?.[0] || 'https://placehold.co/100x100'}" alt="Imagem" width="100"></td>
<div class="botoes">
     <td> <button class="excluir" data-id="${produto.id}">Excluir</button></td>

      <td> <button class="atualizar" data-id="${produto.id}">Atualiazar</button></td>
    </div>`; //Criou as CELULAS(<td>) da nova linha ta tabela, referenciando os campos do forms utilizando ${}

        // Adiciona o evento ao botão de excluir-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        const botaoExcluir = linha.querySelector(".excluir"); //armazena o botao "excluir" que foi criado na linha de cima dentro da variável
        botaoExcluir.addEventListener("click", async () => { //usei funcao "async" pq faz o evento só ser executado depois que a API responder
            const id = botaoExcluir.getAttribute("data-id"); //pega o ID que ta vinculado ao botao, isso serve pro java script saber exatamente qual linha excluir atraves do ID    !!!Informação nova!!!

            if (confirm("Tem certeza que deseja excluir este produto?")) { //esse if entra em ação se o usuário clicar em "ok"
                try {
                    const resposta = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`, { // await usado para "pausar" a execução ate a api responder !!!!Só funciona se estiver dentro de uma função async!!!!
                        method: "DELETE"
                    });


                    linha.remove(); // Remove a linha e 
                    alert("Produto excluído com sucesso!"); //depois manda uma mensagem avisando que foi excluida

                } catch (erro) {
                    console.error("Erro ao excluir produto:", erro);
                    alert("Erro ao excluir produto.");
                }

                // !!!!explicaçao try e catch:(try) SE o usuario clicar em 'ok', a linha que o usuario selecionou vai ser deletada, se clicar em 'cancelar', nao acontece nada, (catch) mas se der ERRO(400), aparece uma mnsagem de erro ao excluir o produto
            }
        });

        //botao atualizar
         const botaoAtualizar = linha.querySelector(".atualizar");
        botaoAtualizar.addEventListener("click", () => {
            formulario.identificacao.value = produto.title;
            formulario.descricao.value = produto.description;
            formulario.preco.value = produto.price;
            formulario.selecione.value = produto.category.id;
            produtoEmEdicao = produto.id;
        });

        tabelaBody.appendChild(linha); // Adiciona a linha (elemento filho) criada na primeira funcao.
    }

    // Função para buscar os produtos na API e carregar na tabela--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    async function carregarProdutos() {
        try {
            const resposta = await fetch("https://api.escuelajs.co/api/v1/products"); //fetch está sendo usado para fazer uma REQUISICAO GET na API!
            const produtos = await resposta.json(); //está convertendo os dados que vieram no GET na API em JSON

            produtos.forEach(produto => adicionarLinha(produto));
        }

        catch (erro) {
            console.error("Erro ao carregar produtos:", erro);
        }
        /* EXPLICAÇÃO FOREACH (para relembrar depois)
        Para cada produto, é chamada a funçao adicionarLinha, q add uma nova linha na tabela com o produto 
        q o usuário cadastrar
        */
    }



    // Envio do formulário----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    formulario.addEventListener("submit", async (e) => { //toda vez que um usuario clica no botao enviar:
        e.preventDefault(); //Não deixa a pagina recarregar dps de enviar o form

        const title = formulario.identificacao.value.trim(); //Pega o nome do Novo Produto
        const description = formulario.descricao.value; // Pega  a descricao 
        const price = parseFloat(formulario.preco.value); // Pega o preço e converte para Numero

        const categoriaSelecionada = formulario.selecione.value; //armazena a categoria que o usuario selecionou no SELECT
        const categoryId = parseInt(categoriaSelecionada); //Pega o ID da categoria selecionada e transforma em numero


        const imageURL = "https://placehold.co/600x400";  //imagem generica pro produto novo

        if (!title || !description || isNaN(price)) { // Ta verificando se o campo titulo  ou descricao ta vazio, e se colocaram string ao inves de numero no preço
            alert("Preencha todos os campos corretamente.");
            return;
        }

        

        const produtoEditado = {  //objeto com as informaçoes q o usuario preencheu no formulario
            title,
            price,
            description,
            categoryId,
            images: [imageURL]
        };

        try {

            let resposta;

            if(produtoEmEdicao) {
                 resposta = await fetch(`https://api.escuelajs.co/api/v1/products/${produtoEmEdicao}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
            },
            body: JSON.stringify(produtoEditado)
        });
    } else{
         resposta = await fetch("https://api.escuelajs.co/api/v1/products/", { //fetch()para a requisição p endpoint da API
                method: "POST", //enviando!!!!!!
                headers: {
                    "Content-Type": "application/json" //esta dizendo pra API que os dados estao em formatp JSON
                },
                body: JSON.stringify(produtoEditado) //transforma o objt produto editado em uma String JSON, para a API entender
            });
        }

         if (!resposta.ok) {
                throw new Error("Erro ao salvar produto"); //se a resposta nao for ok, lança o erro p bloco catch
                
            }

            tabelaBody.innerHTML = ""; //limpa todo o conteudo do corpo da tabela pra atualizar com os novos quando clica em update
            carregarProdutos(); //busca DNV as informacoes do forms e insere na tabela
            formulario.reset();// limpa o formulario
            produtoEmEdicao = null; // deixa como null o produto que tava em edição, (faz voltar pro modo"criacao")
            alert("Produto salvo com sucesso!");

        } catch (erro) {
            console.error("Erro ao salvar produto:", erro); //exibe q houve um erro
            alert("Erro ao salvar produto.");
        }
    });



    // API DO SELECT--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    async function carregarCategorias() {
        const select = document.getElementById("selecione"); //puxa o elemento select e armazena dentro da const select
        try {
            const resposta = await fetch("https://api.escuelajs.co/api/v1/categories"); // requisicao para puxar as categorias da API
            const categorias = await resposta.json(); //converte essa requisicao em json
            categorias.forEach(categoria => {
                const option = document.createElement("option"); //cria um <option> (linhazinha) no select para cada categoria
                option.value = categoria.id; // diz que o valor da option equivale ao id da categoria
                option.textContent = categoria.name; // define o nome q aparece pro usuario em cada categoria (pq se aparecesse o ID, nao teria como saberem do que cada categoria se trata)
                select.appendChild(option); // adiciona tudo isso dentro do select
            });
        } catch (erro) {
            console.error("Erro ao carregar categorias:", erro); // se a API nao responder, ele nao executa o try e vem direto pra ca
        }
    }

    carregarProdutos();
    carregarCategorias();
});