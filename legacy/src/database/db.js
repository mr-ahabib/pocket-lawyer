import * as SQLite from 'expo-sqlite';
import { BANGLADESH_LAWS } from './lawData';

let dbInstance = null;

export const getDB = () => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('pocket_lawyer_bd_v2.db');
  }
  return dbInstance;
};

export const initDB = () => {
  const db = getDB();

  // Create table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS bangladesh_laws (
      id INTEGER PRIMARY KEY,
      act_name TEXT,
      section TEXT,
      title TEXT,
      category TEXT,
      category_bn TEXT,
      offense_situation TEXT,
      legal_provision TEXT,
      penalty TEXT,
      bailable TEXT,
      cognizable TEXT,
      citizen_action TEXT,
      keywords TEXT
    );
  `);

  const countRow = db.getFirstSync('SELECT count(*) as count FROM bangladesh_laws');
  if (!countRow || countRow.count < BANGLADESH_LAWS.length) {
    seedDatabase(db);
  }
};

const seedDatabase = (db) => {
  db.execSync('DELETE FROM bangladesh_laws;');
  
  const stmt = db.prepareSync(`
    INSERT INTO bangladesh_laws (
      id, act_name, section, title, category, category_bn,
      offense_situation, legal_provision, penalty, bailable,
      cognizable, citizen_action, keywords
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  try {
    BANGLADESH_LAWS.forEach(law => {
      stmt.executeSync([
        law.id,
        law.act_name,
        law.section,
        law.title,
        law.category,
        law.category_bn,
        law.offense_situation,
        law.legal_provision,
        law.penalty,
        law.bailable,
        law.cognizable,
        law.citizen_action,
        JSON.stringify(law.keywords || [])
      ]);
    });
  } catch (err) {
    console.error("Error seeding laws db:", err);
  } finally {
    stmt.finalizeSync();
  }
};

export const getAllLaws = () => {
  const db = getDB();
  return db.getAllSync('SELECT * FROM bangladesh_laws ORDER BY id ASC;');
};

export const searchLaws = (query) => {
  if (!query || query.trim() === '') {
    return getAllLaws();
  }

  const db = getDB();
  const cleaned = query.trim().toLowerCase();
  const term = `%${cleaned}%`;

  const stmt = db.prepareSync(`
    SELECT * FROM bangladesh_laws 
    WHERE (
      LOWER(title) LIKE ? 
      OR LOWER(offense_situation) LIKE ? 
      OR LOWER(citizen_action) LIKE ? 
      OR LOWER(keywords) LIKE ? 
      OR LOWER(section) LIKE ?
      OR LOWER(act_name) LIKE ?
    )
    ORDER BY id ASC;
  `);

  try {
    const res = stmt.executeSync([term, term, term, term, term, term]);
    return res.getAllSync();
  } finally {
    stmt.finalizeSync();
  }
};
