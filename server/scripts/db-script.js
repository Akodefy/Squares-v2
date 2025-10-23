// db-script.js
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri = "mongodb+srv://squares:HbpqwfWiJvR00bG7@cluster0.loonmqw.mongodb.net/ninety-nine-acres";

const client = new MongoClient(uri);

async function exportAllCollections() {
  try {
    await client.connect();
    const db = client.db("ninety-nine-acres");

    // Create output folder
    const exportDir = path.join(process.cwd(), "mongo_exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    // Get all collections
    const collections = await db.listCollections().toArray();

    for (const coll of collections) {
      const name = coll.name;
      console.log(`📦 Exporting collection: ${name}`);

      const data = await db.collection(name).find({}).toArray();
      const filePath = path.join(exportDir, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    }

    console.log("✅ All collections exported successfully to 'mongo_exports/'");
  } catch (err) {
    console.error("❌ Error exporting collections:", err);
  } finally {
    await client.close();
  }
}

exportAllCollections();
