import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, ProgressBar } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Budget = ({ transactions, budgets = [], onAddBudget, onUpdateBudget, onDeleteBudget }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // Update form state to include recurring option

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    type: 'expense',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    notes: ''
  });
  // Filter budgets by selected month and year
  const filteredBudgets = budgets.filter(budget => 
    budget.month === selectedMonth && budget.year === selectedYear
  );

  // Filter transactions by selected month and year
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });

  // Group transactions by category and type
  const transactionsByCategory = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Uncategorized';
    const type = transaction.type;
    
    if (!acc[type]) acc[type] = {};
    if (!acc[type][category]) acc[type][category] = 0;
    
    acc[type][category] += parseFloat(transaction.amount);
    return acc;
  }, { income: {}, expense: {} });

  // Calculate budget progress
  const calculateBudgetProgress = (budget) => {
    const { category, amount, type } = budget;
    const spent = transactionsByCategory[type]?.[category] || 0;
    
    const percentUsed = type === 'expense' 
      ? (spent / amount) * 100 
      : (spent / amount) * 100;
    
    return {
      spent,
      remaining: type === 'expense' ? amount - spent : spent - amount,
      percentUsed: Math.min(percentUsed, 100), // Cap at 100% for UI
      isOverBudget: type === 'expense' ? spent > amount : spent < amount
    };
  };

  // Prepare data for chart
  const prepareChartData = () => {
    return filteredBudgets.map(budget => {
      const progress = calculateBudgetProgress(budget);
      return {
        name: budget.category,
        budgeted: budget.amount,
        actual: progress.spent,
        type: budget.type
      };
    });
  };

  const chartData = prepareChartData();
  
  // Separate income and expense budgets
  const expenseBudgets = filteredBudgets.filter(budget => budget.type === 'expense');
  const incomeBudgets = filteredBudgets.filter(budget => budget.type === 'income');

  // Calculate totals
  const totalBudgetedExpense = expenseBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalBudgetedIncome = incomeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalActualExpense = Object.values(transactionsByCategory.expense || {})
    .reduce((sum, amount) => sum + amount, 0);
  const totalActualIncome = Object.values(transactionsByCategory.income || {})
    .reduce((sum, amount) => sum + amount, 0);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'category' || name === 'type' || name === 'notes' 
        ? value 
        : name === 'month' || name === 'year' 
          ? parseInt(value) 
          : parseFloat(value) || 0
    });
  };

  // Handle form submission for adding a new budget
  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAddBudget({
      id: Date.now().toString(),
      ...formData
    });
    setShowAddModal(false);
    resetForm();
  };

  // Handle form submission for editing a budget
  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateBudget({
      ...currentBudget,
      ...formData
    });
    setShowEditModal(false);
    resetForm();
  };

  // Open edit modal with budget data
  const handleEditClick = (budget) => {
    setCurrentBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      type: budget.type,
      month: budget.month,
      year: budget.year,
      notes: budget.notes || '',
      isRecurring: budget.isRecurring || false
    });
    setShowEditModal(true);
  };
  // Reset form data
  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      type: 'expense',
      month: selectedMonth,
      year: selectedYear,
      notes: '',
      isRecurring: false
    });
    setCurrentBudget(null);
  };

  // Month names for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year and 5 years back/forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Common expense categories
  const expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Personal Care',
    'Education',
    'Travel',
    'Debt Payment',
    'Other'
  ];

  // Common income categories
  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investments',
    'Gifts',
    'Refunds',
    'Rental Income',
    'Side Hustle',
    'Other'
  ];

  // Function to handle recurring budgets
  const handleRecurringBudgets = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Find recurring budgets from previous months that need to be copied to current month
    const recurringBudgetsToAdd = budgets.filter(budget => 
      budget.isRecurring && 
      (budget.month !== currentMonth || budget.year !== currentYear) &&
      !budgets.some(existingBudget => 
        existingBudget.category === budget.category && 
        existingBudget.type === budget.type &&
        existingBudget.month === currentMonth &&
        existingBudget.year === currentYear
      )
    );
    
    // Add recurring budgets for current month if they don't exist
    if (recurringBudgetsToAdd.length > 0) {
      recurringBudgetsToAdd.forEach(budget => {
        onAddBudget({
          ...budget,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          month: currentMonth,
          year: currentYear
        });
      });
    }
  };

  // Update form month/year when period selection changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      month: selectedMonth,
      year: selectedYear
    }));
  }, [selectedMonth, selectedYear]);
  // Check for recurring budgets when component mounts or month/year changes
  useEffect(() => {
    handleRecurringBudgets();
  }, []);
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Budget Planning</h2>
        <div className="d-flex">
          <Form.Select 
            className="me-2" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </Form.Select>
          <Form.Select 
            className="me-2"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Form.Select>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add Budget Item
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Budgeted Income</Card.Title>
              <Card.Text className="text-success">
                ${totalBudgetedIncome.toFixed(2)}
              </Card.Text>
              <Card.Text className="small text-muted">
                Actual: ${totalActualIncome.toFixed(2)}
                {totalActualIncome > 0 && (
                  <span className={totalActualIncome >= totalBudgetedIncome ? "text-success" : "text-danger"}>
                    {" "}({((totalActualIncome / totalBudgetedIncome) * 100).toFixed(0)}%)
                  </span>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Budgeted Expenses</Card.Title>
              <Card.Text className="text-danger">
                ${totalBudgetedExpense.toFixed(2)}
              </Card.Text>
              <Card.Text className="small text-muted">
                Actual: ${totalActualExpense.toFixed(2)}
                {totalBudgetedExpense > 0 && (
                  <span className={totalActualExpense <= totalBudgetedExpense ? "text-success" : "text-danger"}>
                    {" "}({((totalActualExpense / totalBudgetedExpense) * 100).toFixed(0)}%)
                  </span>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Expected Savings</Card.Title>
              <Card.Text className={totalBudgetedIncome - totalBudgetedExpense >= 0 ? "text-success" : "text-danger"}>
                ${(totalBudgetedIncome - totalBudgetedExpense).toFixed(2)}
              </Card.Text>
              <Card.Text className="small text-muted">
                Actual: ${(totalActualIncome - totalActualExpense).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {chartData.length > 0 ? (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Budget vs Actual</Card.Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="budgeted" name="Budgeted" fill="#8884d8" />
                      <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Expense Budget</Card.Title>
                  {expenseBudgets.length > 0 ? (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Budgeted</th>
                          <th>Spent</th>
                          <th>Remaining</th>
                          <th>Progress</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenseBudgets.map((budget) => {
                          const progress = calculateBudgetProgress(budget);
                          
                          return (
                            <tr key={budget.id}>
                              <td>{budget.category}</td>
                              <td>${budget.amount.toFixed(2)}</td>
                              <td>${progress.spent.toFixed(2)}</td>
                              <td className={progress.isOverBudget ? "text-danger" : "text-success"}>
                                ${progress.remaining.toFixed(2)}
                              </td>
                              <td style={{ width: '20%' }}>
                                <ProgressBar 
                                  now={progress.percentUsed} 
                                  label={`${progress.percentUsed.toFixed(0)}%`}
                                  variant={progress.isOverBudget ? "danger" : "success"}
                                />
                              </td>
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="me-1"
                                  onClick={() => handleEditClick(budget)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => onDeleteBudget(budget.id)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center p-3">
                      <p>No expense budgets set for this period</p>
                      <Button variant="outline-primary" size="sm" onClick={() => {
                        setFormData(prev => ({ ...prev, type: 'expense' }));
                        setShowAddModal(true);
                      }}>
                        Add Expense Budget
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Income Budget</Card.Title>
                  {incomeBudgets.length > 0 ? (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Expected</th>
                          <th>Received</th>
                          <th>Difference</th>
                          <th>Progress</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomeBudgets.map((budget) => {
                          const progress = calculateBudgetProgress(budget);
                          
                          return (
                            <tr key={budget.id}>
                              <td>{budget.category}
                              {budget.isRecurring && (
                                <span className="ms-2 badge bg-info">Recurring</span>
                              )}
                            </td>
                              <td>${budget.amount.toFixed(2)}</td>
                              <td>${progress.spent.toFixed(2)}</td>
                              <td className={progress.isOverBudget ? "text-danger" : "text-success"}>
                                ${progress.remaining.toFixed(2)}
                              </td>
                              <td style={{ width: '20%' }}>
                                <ProgressBar 
                                  now={progress.percentUsed} 
                                  label={`${progress.percentUsed.toFixed(0)}%`}
                                  variant={progress.isOverBudget ? "danger" : "success"}
                                />
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="me-1"
                                  onClick={() => handleEditClick(budget)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => onDeleteBudget(budget.id)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center p-3">
                      <p>No income budgets set for this period</p>
                      <Button variant="outline-primary" size="sm" onClick={() => {
                        setFormData(prev => ({ ...prev, type: 'income' }));
                        setShowAddModal(true);
                      }}>
                        Add Income Budget
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            <Card.Title>No Budget Items Yet</Card.Title>
            <Card.Text>
              Start planning your finances by adding your first budget item.
            </Card.Text>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Create Your First Budget
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Add Budget Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Budget Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
              >
                <option value="">Select a category</option>
                {formData.type === 'expense' ? (
                  expenseCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))
                ) : (
                  incomeCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))
                )}
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
                min="0.01" 
                step="0.01"
                placeholder="0.00"
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Month</Form.Label>
                  <Form.Select 
                    name="month" 
                    value={formData.month} 
                    onChange={handleChange} 
                    required
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Select 
                    name="year" 
                    value={formData.year} 
                    onChange={handleChange} 
                    required
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Add any additional notes"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="recurring-budget-checkbox"
                label="Make this a recurring monthly budget"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
              />
              {formData.isRecurring && (
                <Form.Text className="text-muted">
                  This budget will automatically be created for future months.
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Budget Item
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Budget Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
              >
                <option value="">Select a category</option>
                {formData.type === 'expense' ? (
                  expenseCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))
                ) : (
                  incomeCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))
                )}
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
                min="0.01" 
                step="0.01"
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Month</Form.Label>
                  <Form.Select 
                    name="month" 
                    value={formData.month} 
                    onChange={handleChange} 
                    required
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Select 
                    name="year" 
                    value={formData.year} 
                    onChange={handleChange} 
                    required
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Add any additional notes"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="recurring-budget-checkbox"
                label="Make this a recurring monthly budget"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
              />
              {formData.isRecurring && (
                <Form.Text className="text-muted">
                  This budget will automatically be created for future months.
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Budget;