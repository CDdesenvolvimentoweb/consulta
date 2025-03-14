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

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
