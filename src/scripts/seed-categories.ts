// TODO:

import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "New and politics",
  "People and blogs",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
  "Costume dramas",
  "Lu Yi",
  "News",
  "Qin Lan",
  "APIs",
  "Live",
  "Mixes",
  "Fishkeeping",
  "Source code",
  "Joe Hisaishi",
  "Playlists",
  "Youth music",
  "Golden music",
  "Roasting",
];

async function main() {
  console.log("Seeding");

  try {
    const values = categoryNames.map((name)=>({
        name,
        description: `Videos related to ${name.toLowerCase()}`
    }))
    await db.insert(categories).values(values)
  } catch (e) {
    console.log(e, "seeding");
  }
}

main();
