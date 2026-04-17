import express from "express";
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addExpense);

router.get("/", getExpenses);

router.put("/:id", updateExpense);

router.delete("/:id", deleteExpense);

export default router;
