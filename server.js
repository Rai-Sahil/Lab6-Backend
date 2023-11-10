const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const definitionRoute = '/api/v1/definition';
const wordDefinitionRoute = '/api/v1/definition/:word';
const getLanguageRoute = '/api/v1/languages';
const serverMsg = "Server is running on port";
const updateMsg = "Dictionary entry updated successfully";
const wordExistsMsg = "Word already exists in the dictionary. Do you want to update the definition?";
const wordNotFoundMsg = "Word not found in the dictionary";
const update = "update";
const insert = "inserted";
const dbCheck = "DB check result is ";
const wordDeleted = "Word deleted successfully";
const app = express();
const port = 3000;
let numbeOfRequests = 0;
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// Create a new dictionary entry or update if the word exists
app.post(definitionRoute, async (req, res) => {
  const newEntry = req.body;

  if (await db.wordExists(newEntry.word)) {
    return res.status(200).json({
      message: wordExistsMsg,
      word: newEntry.word,
      action: update,
    });
  } else {
    db.insertWord(newEntry.word, newEntry.definition, newEntry.wordLanguage, newEntry.definitionLanguage)
    res.status(201).json({ message: updateMsg, entry: newEntry, action: insert, total: ++numbeOfRequests })
  }

  console.log(dbCheck + db.wordExists(newEntry.word));
});

// Handle the update when the user confirms
app.patch(wordDefinitionRoute, (req, res) => {
  const wordToUpdate = req.params.word;
  const newDefinition = req.body.definition;
  const newWordLanguage = req.body.wordLanguage;
  const newDefinitionLanguage = req.body.definitionLanguage;

  if (db.updateWord(wordToUpdate, newDefinition, newWordLanguage, newDefinitionLanguage)) {
    res.status(200).json({ message: updateMsg, total: ++numbeOfRequests});
  } else {
    res.status(404).json({ message: wordNotFoundMsg, total: ++numbeOfRequests });
  }
});


// Retrieve the definition of a word
app.get(wordDefinitionRoute, async (req, res) => {
  const wordToRetrieve = req.params.word;
  const wordExists = await db.wordExists(wordToRetrieve);

  if (wordExists) {
    const definition = await db.getDefinition(wordToRetrieve);
    res.status(200).json({ definition: definition, total: ++numbeOfRequests });
  } else {
    res.status(404).json({ message: wordNotFoundMsg, total: ++numbeOfRequests});
  }
});


// Remove the word and its definition
app.delete(wordDefinitionRoute, async (req, res) => {
  const wordToDelete = req.params.word;
  if (await db.deleteWord(wordToDelete)) {
    res.status(200).json({ message: wordDeleted, total: ++numbeOfRequests });
  } else {
    res.status(404).json({ message: wordNotFoundMsg, total: ++numbeOfRequests });
  }
});

// Retrieve supported languages
app.get(getLanguageRoute , async (req, res) => {
  // Replace with your list of supported languages
  const supportedLanguages = await db.getLanguages();
  res.status(200).json({ supportedLanguages: supportedLanguages });
});


app.listen(port, () => {
  console.log(serverMsg + port);
});
