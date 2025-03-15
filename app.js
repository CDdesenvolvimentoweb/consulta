require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rotas
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

app.post('/cadastrar-produto', async (req, res) => {
    const { nome, quantidade } = req.body;
    try {
        const { data, error } = await supabase
            .from('produtos')
            .insert([{ nome, quantidade }]);
        
        if (error) throw error;
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/produtos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('nome');
        
        if (error) throw error;
        res.render('produtos', { produtos: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para a página de edição de produto
app.get('/editar/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (error) throw error;
        res.render('editar', { produto: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para atualizar a quantidade do produto
app.post('/atualizar-quantidade/:id', async (req, res) => {
    const { quantidade, operacao } = req.body;
    const id = req.params.id;

    try {
        // Primeiro, obtém a quantidade atual
        const { data: produto, error: selectError } = await supabase
            .from('produtos')
            .select('quantidade')
            .eq('id', id)
            .single();

        if (selectError) throw selectError;

        // Calcula a nova quantidade
        let novaQuantidade;
        if (operacao === 'adicionar') {
            novaQuantidade = produto.quantidade + parseInt(quantidade);
        } else if (operacao === 'subtrair') {
            novaQuantidade = produto.quantidade - parseInt(quantidade);
            if (novaQuantidade < 0) {
                return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
            }
        } else {
            novaQuantidade = parseInt(quantidade); // Definir valor específico
        }

        // Atualiza o produto com a nova quantidade
        const { error: updateError } = await supabase
            .from('produtos')
            .update({ quantidade: novaQuantidade })
            .eq('id', id);

        if (updateError) throw updateError;

        res.redirect('/produtos');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
