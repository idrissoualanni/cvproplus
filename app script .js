// Ce script est à placer dans l'éditeur Google Apps Script lié à votre Google Sheet.

// OPTIONNEL : Pour une meilleure organisation, vous pouvez créer un dossier dans Drive
// et coller son ID ici. Sinon, un dossier "CVs" sera créé à la racine de votre Drive.
const DRIVE_FOLDER_ID = ''; // Ex: '1a2b3c4d5e6f7g8h9i0j'

function doPost(e) {
  try {
    // Récupère les données envoyées depuis le formulaire HTML
    const data = JSON.parse(e.postData.contents);

    // Sauvegarde le fichier dans Google Drive et récupère son URL
    const fileUrl = saveFileToDrive(data.cvFile, data.name);

    // Ouvre la feuille de calcul à laquelle ce script est rattaché
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheets()[0]; // On travaille sur la première feuille

    // Prépare la feuille en ajoutant les en-têtes si elle est vide
    prepareSheet(sheet);

    // Ajoute une nouvelle ligne avec les données
    sheet.appendRow([
      new Date(),   // Horodatage
      data.name,    // Nom
      data.email,   // Email
      data.options, // Options choisies
      fileUrl       // Lien vers le fichier CV dans Google Drive
    ]);

    // Renvoie une réponse de succès au client
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', message: 'Données enregistrées.' }))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // En cas d'erreur, l'enregistre dans les logs du script
    Logger.log(error.toString());
    // Renvoie une réponse d'erreur au client
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveFileToDrive(fileData, applicantName) {
  const folderName = "CVs Reçus";
  let folder;

  if (DRIVE_FOLDER_ID) {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } else {
    const folders = DriveApp.getFoldersByName(folderName);
    folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  }

  const decodedFile = Utilities.base64Decode(fileData.base64);
  const blob = Utilities.newBlob(decodedFile, fileData.type, fileData.name);
  const fileName = `${new Date().toISOString().slice(0,10)}_${applicantName}_${fileData.name}`;
  const file = folder.createFile(blob).setName(fileName);
  return file.getUrl();
}

function prepareSheet(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = ['Horodatage', 'Nom', 'Email', 'Options choisies', 'Lien vers le CV'];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1); // Gèle la première ligne pour qu'elle reste visible
    sheet.getRange('A1:E1').setFontWeight('bold');
  }
}
