import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar, Tab, Tabs } from 'react-bootstrap'
// Import your components
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransactionForm from './components/AddTransactionForm';
import Goals from './components/Goals';
import Budget from './components/Budget';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const savedGoals = JSON.parse(localStorage.getItem('goals')) || [];
    const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
    setTransactions(savedTransactions);
    setGoals(savedGoals);
    setBudgets(savedBudgets);
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Function to add a new transaction
  const handleAddTransaction = (newTransaction) => {
    setTransactions([...transactions, newTransaction]);
  };

  // Functions to manage goals
  const handleAddGoal = (newGoal) => {
    setGoals([...goals, newGoal]);
  };

  const handleUpdateGoal = (updatedGoal) => {
    setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  // Functions to manage budgets
  const handleAddBudget = (newBudget) => {
    setBudgets([...budgets, newBudget]);
  };

  const handleUpdateBudget = (updatedBudget) => {
    setBudgets(budgets.map(budget => budget.id === updatedBudget.id ? updatedBudget : budget));
  };

  const handleDeleteBudget = (budgetId) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">
            <img
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="React logo"
            />{' '}
            Finance Tracker
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#transactions">Transactions</Nav.Link>
              <Nav.Link href="#add">Add New</Nav.Link>
              <Nav.Link href="#budget">Budget</Nav.Link>
              <Nav.Link href="#goals">Goals</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Tabs defaultActiveKey="dashboard" id="main-tabs" className="mb-3">
          <Tab eventKey="dashboard" title="Dashboard">
            <Dashboard 
              transactions={transactions} 
              goals={goals}
              budgets={budgets}
              onViewAllGoals={() => {
                const tabsElement = document.querySelector('a[data-rr-ui-event-key="goals"]');
                if (tabsElement) {
                  tabsElement.click();
                }
              }}
            />
          </Tab>
          <Tab eventKey="transactions" title="Transactions">
            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={(id) => setTransactions(transactions.filter(t => t.id !== id))}
            />
          </Tab>
          <Tab eventKey="add" title="Add Transaction">
            <AddTransactionForm onAddTransaction={handleAddTransaction} />
          </Tab>
          <Tab eventKey="budget" title="Budget">
            <Budget 
              transactions={transactions}
              budgets={budgets}
              onAddBudget={handleAddBudget}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </Tab>
          <Tab eventKey="goals" title="Goals">
            <Goals 
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </Tab>
        </Tabs>
      </Container>
    </div>  
  );
}

export default App;
