import React, { useState } from 'react';
import { Card, Container, Row, Col, Form, Table, ProgressBar, Button } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
// Remove the react-router-dom import for now

const Dashboard = ({ transactions, goals = [], onViewAllGoals = () => {} }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filter transactions by selected month and year
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });

  // Calculate total income
  const totalIncome = filteredTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  // Calculate total expenses
  const totalExpenses = filteredTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  // Calculate balance
  const balance = totalIncome - totalExpenses;

  // Expected values (these would typically come from a budget)
  const expectedIncome = 5000; // Example value
  const expectedExpenses = 3500; // Example value

  // Prepare data for income vs expenses pie chart
  const overviewData = [
    { name: 'Income', value: totalIncome, color: '#4CAF50' },
    { name: 'Expenses', value: totalExpenses, color: '#F44336' }
  ];

  // Prepare data for monthly bar chart
  const monthlyData = [
    { name: 'Income', actual: totalIncome, expected: expectedIncome },
    { name: 'Expenses', actual: totalExpenses, expected: expectedExpenses }
  ];

  // Prepare data for expenses by category pie chart
  const expensesByCategory = filteredTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(transaction.amount);
      return acc;
    }, {});

  const categoryData = Object.keys(expensesByCategory).map((category, index) => ({
    name: category,
    value: expensesByCategory[category],
    color: getColorForIndex(index)
  }));

  // Helper function to generate colors for categories
  function getColorForIndex(index) {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8D6E63', '#26A69A'];
    return colors[index % colors.length];
  }

  // Month names for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Financial Dashboard</h2>
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
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Form.Select>
        </div>
      </div>

      <Row className="mt-4">
        <Col md={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Balance</Card.Title>
              <Card.Text className={balance >= 0 ? 'text-success' : 'text-danger'}>
                ${balance.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Income</Card.Title>
              <Card.Text className="text-success">
                ${totalIncome.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Expenses</Card.Title>
              <Card.Text className="text-danger">
                ${totalExpenses.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Monthly Overview</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="actual" name="Actual" fill="#8884d8" />
                  <Bar dataKey="expected" name="Expected" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Income vs Expenses</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overviewData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Expenses by Category</Card.Title>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cat-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center p-5">
                  <p>No expense data available for this period</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title>Financial Goals</Card.Title>
                <Button variant="primary" size="sm" onClick={onViewAllGoals}>View All</Button>
              </div>
              {goals.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Goal</th>
                      <th>Target</th>
                      <th>Collected</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goals.slice(0, 3).map((goal, index) => {
                      const progressPercent = (goal.collected / goal.target) * 100;
                      return (
                        <tr key={index}>
                          <td>{goal.title}</td>
                          <td>${goal.target.toFixed(2)}</td>
                          <td>${goal.collected.toFixed(2)}</td>
                          <td>
                            <ProgressBar 
                              now={progressPercent} 
                              label={`${progressPercent.toFixed(0)}%`}
                              variant={progressPercent >= 100 ? "success" : "primary"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center p-5">
                  <p>No goals set yet</p>
                  <Button variant="outline-primary" onClick={onViewAllGoals}>Add a Goal</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;