import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar, Tab, Tabs, NavDropdown } from 'react-bootstrap'
// Import your components
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransactionForm from './components/AddTransactionForm';
import Goals from './components/Goals';
import Budget from './components/Budget';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');

  // Check if user is logged in
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Load data from localStorage on initial render
  useEffect(() => {
    if (user) {
      const userId = user.id;
      const savedTransactions = JSON.parse(localStorage.getItem(`transactions_${userId}`)) || [];
      const savedGoals = JSON.parse(localStorage.getItem(`goals_${userId}`)) || [];
      const savedBudgets = JSON.parse(localStorage.getItem(`budgets_${userId}`)) || [];
      setTransactions(savedTransactions);
      setGoals(savedGoals);
      setBudgets(savedBudgets);
    } else {
      const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
      const savedGoals = JSON.parse(localStorage.getItem('goals')) || [];
      const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
      setTransactions(savedTransactions);
      setGoals(savedGoals);
      setBudgets(savedBudgets);
    }
  }, [user]);

  // Save data to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
    } else {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`goals_${user.id}`, JSON.stringify(goals));
    } else {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`budgets_${user.id}`, JSON.stringify(budgets));
    } else {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [budgets, user]);

  // Function to handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  // Function to handle registration
  const handleRegister = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setActiveTab('dashboard');
  };

  // Function to update user profile
  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

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

  // If user is not logged in, show authentication screens
  if (!user) {
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
          </Container>
        </Navbar>

        {authView === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setAuthView('register')} 
          />
        ) : (
          <Register 
            onRegister={handleRegister} 
            onSwitchToLogin={() => setAuthView('login')} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home" onClick={() => setActiveTab('dashboard')}>
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
              <Nav.Link 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'transactions'} 
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'add'} 
                onClick={() => setActiveTab('add')}
              >
                Add New
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'budget'} 
                onClick={() => setActiveTab('budget')}
              >
                Budget
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'goals'} 
                onClick={() => setActiveTab('goals')}
              >
                Goals
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown 
                title={user.name || 'Account'} 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item onClick={() => setActiveTab('profile')}>
                  Profile Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => setActiveTab(k)} 
          id="main-tabs" 
          className="mb-3"
        >
          <Tab eventKey="dashboard" title="Dashboard">
            <Dashboard 
              transactions={transactions} 
              goals={goals}
              budgets={budgets}
              onViewAllGoals={() => setActiveTab('goals')}
            />
          </Tab>
          <Tab eventKey="transactions" title="Transactions">
            <TransactionList 
              transactions={transactions} 
              budgets={budgets}
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
          <Tab eventKey="profile" title="Profile" className="d-none">
            <UserProfile 
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
            />
          </Tab>
        </Tabs>
      </Container>
    </div>  
  );
}

export default App;
