import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { College } from "../models/college.model.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path relative to src/utils
const CSV_PATH = path.join(__dirname, "../../public/InstitutesList.csv");

const importCollegesFromCSV = async () => {
  return new Promise((resolve, reject) => {
    const colleges = [];
    console.log(`Reading CSV from: ${CSV_PATH}`);

    if (!fs.existsSync(CSV_PATH)) {
      // In a controller context, we might want to throw or reject
      console.error(`File not found: ${CSV_PATH}`);
      return reject(new Error(`File not found: ${CSV_PATH}`));
    }

    fs.createReadStream(CSV_PATH)
      .pipe(csv({
        mapHeaders: ({ header }) => {
          // Remove BOM if present
          return header.trim().replace(/^\ufeff/, '');
        }
      }))
      .on("data", (row) => {
        // Map CSV fields to schema
        if (row.Name) {
          colleges.push({
            name: row.Name.trim(),
            location: `${row.District}, ${row.State}`,
          });
        }
      })
      .on("end", async () => {
        console.log(`Parsed ${colleges.length} colleges.`);

        let successCount = 0;
        let errorCount = 0;

        // Process sequentially or in batches to avoid overwhelming DB?
        // For 50k records, sequential might be slow but safe. 
        // Let's stick to sequential for now as per initial plan.

        for (const collegeData of colleges) {
          try {
            await College.updateOne(
              { name: collegeData.name },
              { $set: collegeData },
              { upsert: true }
            );
            successCount++;
            if (successCount % 1000 === 0) {
              console.log(`Processed ${successCount} records...`);
            }
          } catch (err) {
            console.error(`Error importing ${collegeData.name}:`, err.message);
            errorCount++;
          }
        }

        console.log(`Import completed. Success: ${successCount}, Errors: ${errorCount}`);
        resolve({ successCount, errorCount });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

export { importCollegesFromCSV };
