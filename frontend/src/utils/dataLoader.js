/**
 * Data loader utility for accessing audit data
 * In development, this will load from the data folder via Vite's public directory
 */

export async function loadLatestAudit() {
  try {
    const response = await fetch('/audits/latest.json');
    if (!response.ok) {
      throw new Error('Aucune donnée d\'audit disponible. Veuillez exécuter un audit d\'abord.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading audit data:', error);
    throw new Error(`Erreur de chargement des données: ${error.message}`);
  }
}

export async function loadAuditByFilename(filename) {
  try {
    const response = await fetch(`/audits/${filename}`);
    if (!response.ok) {
      throw new Error(`Audit ${filename} non trouvé`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Erreur de chargement: ${error.message}`);
  }
}

export async function listAvailableAudits() {
  try {
    const response = await fetch('/audits/index.json');
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des audits:', error);
    return [];
  }
}
