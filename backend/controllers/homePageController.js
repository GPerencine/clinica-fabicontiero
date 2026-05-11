const HomePage = require('../models/HomePage');

// Get home page content
exports.getHomePage = async (req, res) => {
  try {
    let homePage = await HomePage.findOne();
    if (!homePage) {
      // If no document exists, create an empty one with defaults
      homePage = await HomePage.create({});
    }
    res.json(homePage);
  } catch (err) {
    console.error('Error fetching HomePage:', err);
    res.status(500).json({ error: 'Erro ao buscar o conteúdo da página inicial' });
  }
};

// Update home page content
exports.updateHomePage = async (req, res) => {
  try {
    const { essencia, resultados } = req.body;
    
    // Upsert the single document
    let homePage = await HomePage.findOne();
    if (homePage) {
      homePage.essencia = essencia || homePage.essencia;
      homePage.resultados = resultados || homePage.resultados;
    } else {
      homePage = new HomePage({ essencia, resultados });
    }
    
    await homePage.save();
    
    res.json(homePage);
  } catch (err) {
    console.error('Error updating HomePage:', err);
    res.status(500).json({ error: 'Erro ao atualizar o conteúdo da página inicial' });
  }
};
