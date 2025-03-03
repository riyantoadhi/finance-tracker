import React, { useState } from 'react';
import { Table, Container, Button, Form, InputGroup, ProgressBar } from 'react-bootstrap';
import { FaTrash, FaSearch } from 'react-icons/fa';

const TransactionList = ({ transactions, onDeleteTransaction, budgets = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filter transactions based on search term and type
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  // Get current month's budgets
  const currentBudgets = budgets.filter(budget => 
    budget.month === currentMonth && budget.year === currentYear
  );

  // Calculate remaining budget for a transaction
  const getRemainingBudget = (transaction) => {
    const transactionDate = new Date(transaction.date);
    const transMonth = transactionDate.getMonth();
    const transYear = transactionDate.getFullYear();
    
    // Find matching budget for this transaction's category and type
    const matchingBudget = budgets.find(budget => 
      budget.category === transaction.category && 
      budget.type === transaction.type &&
      budget.month === transMonth &&
      budget.year === transYear
    );
    
    if (!matchingBudget) return null;
    
    // Calculate total spent in this category for the month
    const totalSpent = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.category === transaction.category && 
               t.type === transaction.type &&
               tDate.getMonth() === transMonth &&
               tDate.getFullYear() === transYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const remaining = transaction.type === 'expense' 
      ? matchingBudget.amount - totalSpent
      : totalSpent - matchingBudget.amount;
    
    const percentUsed = (totalSpent / matchingBudget.amount) * 100;
    
    return {
      budgeted: matchingBudget.amount,
      spent: totalSpent,
      remaining,
      percentUsed: Math.min(percentUsed, 100),
      isOverBudget: transaction.type === 'expense' 
        ? totalSpent > matchingBudget.amount 
        : totalSpent < matchingBudget.amount
    };
  };

  return (
    <Container className="mt-4">
      <h2>Transaction History</h2>
      
      <div className="d-flex justify-content-between mb-3">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Form.Select 
          className="w-25"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Transactions</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </Form.Select>
      </div>
      
      {filteredTransactions.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Budget Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => {
              const budgetInfo = getRemainingBudget(transaction);
              
              return (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.category}</td>
                  <td className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    {budgetInfo ? (
                      <div>
                        <small className="d-flex justify-content-between">
                          <span>Budget: ${budgetInfo.budgeted.toFixed(2)}</span>
                          <span className={budgetInfo.isOverBudget ? 'text-danger' : 'text-success'}>
                            Remaining: ${budgetInfo.remaining.toFixed(2)}
                          </span>
                        </small>
                        <ProgressBar 
                          now={budgetInfo.percentUsed} 
                          variant={budgetInfo.isOverBudget ? 'danger' : 'success'} 
                          style={{ height: '5px' }}
                        />
                      </div>
                    ) : (
                      <small className="text-muted">No budget set</small>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => onDeleteTransaction(transaction.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <div className="text-center p-3 bg-light">
          <p className="mb-0">No transactions found</p>
        </div>
      )}
    </Container>
  );
};

export default TransactionList;