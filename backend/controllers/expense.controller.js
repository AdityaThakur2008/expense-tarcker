import Expense from "../models/expense.model.js";

// Add a new expense for the authenticated user

const addExpense = async (req, res, next) => {
  try {
    const { amount, category, description, paymentMethod, date } = req.body;
    const userId = req.user.id; // Assumes auth middleware sets req.user.id

    // Basic validation
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be greater than 0" });
    }
    if (!paymentMethod || !["cash", "card", "upi"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    const expense = new Expense({
      userId,
      amount,
      category: category || "Other",
      description,
      paymentMethod,
      date: date || new Date(),
    });

    await expense.save();
    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};


// Get all expenses for the authenticated user, sorted by latest date first  

const getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.json({
      success: true,
      message: "Expenses retrieved successfully",
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};


//  Update an expense for the authenticated user

const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Basic validation
    if (updates.amount && updates.amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be greater than 0" });
    }
    if (
      updates.paymentMethod &&
      !["cash", "card", "upi"].includes(updates.paymentMethod)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true },
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or not owned by user",
      });
    }

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};


// Delete an expense for the authenticated user

const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or not owned by user",
      });
    }

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { addExpense, getExpenses, updateExpense, deleteExpense };
