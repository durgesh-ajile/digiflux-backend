import Category from "../models/Category.js";
import mongoose from "mongoose";

export async function addCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const cat = new Category({ name: name.trim() });
    await cat.save();

    return res.status(201).json(cat);
  } catch (err) {
    console.error("Add Category error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getCategories(req, res) {
  try {
    const list = await Category.find().sort({ name: 1 });
    return res.json(list);
  } catch (err) {
    console.error("Get Categories error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid category id" });

    const exists = await Category.findById(id);
    if (!exists) return res.status(404).json({ message: "Category not found" });

    await Category.deleteOne({ _id: id });
    return res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete Category error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
