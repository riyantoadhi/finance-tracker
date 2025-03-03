import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, ProgressBar, Button, Modal, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Goals = ({ goals = [], onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    collected: '',
    deadline: '',
    description: '',
    monthlyContribution: ''
  });

  // Calculate months remaining and projections
  const calculateProjection = (goal) => {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    
    // Calculate months between now and deadline
    const monthsRemaining = (deadline.getFullYear() - today.getFullYear()) * 12 + 
                           (deadline.getMonth() - today.getMonth());
    
    // Calculate monthly contribution needed
    const remainingAmount = goal.target - goal.collected;
    const monthlyNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
    
    // Calculate projected completion date based on current monthly contribution
    const monthsToComplete = goal.monthlyContribution > 0 
      ? Math.ceil(remainingAmount / goal.monthlyContribution) 
      : Infinity;
    
    const projectedDate = new Date(today);
    projectedDate.setMonth(projectedDate.getMonth() + monthsToComplete);
    
    return {
      monthsRemaining,
      monthlyNeeded,
      projectedDate,
      onTrack: goal.monthlyContribution >= monthlyNeeded
    };
  };
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'title' || name === 'description' || name === 'deadline' 
        ? value 
        : parseFloat(value) || 0
    });
  };
  // Handle form submission for adding a new goal
  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAddGoal({
      id: Date.now().toString(),
      ...formData
    });
    setShowAddModal(false);
    resetForm();
  };
  // Handle form submission for editing a goal
  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateGoal({
      ...currentGoal,
      ...formData
    });
    setShowEditModal(false);
    resetForm();
  };
  // Open edit modal with goal data
  const handleEditClick = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      title: goal.title,
      target: goal.target,
      collected: goal.collected,
      deadline: goal.deadline,
      description: goal.description || '',
      monthlyContribution: goal.monthlyContribution || 0
    });
    setShowEditModal(true);
  };
  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      target: '',
      collected: '',
      deadline: '',
      description: '',
      monthlyContribution: ''
    });
    setCurrentGoal(null);
  };
  // Prepare data for projection chart
  const prepareChartData = (goals) => {
    return goals.map(goal => {
      const projection = calculateProjection(goal);
      return {
        name: goal.title,
        current: goal.collected,
        target: goal.target,
        projected: goal.collected + (projection.monthsRemaining * goal.monthlyContribution)
      };
    });
  };
  const chartData = prepareChartData(goals);
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Financial Goals</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add New Goal
        </Button>
      </div>
  {goals.length > 0 ? (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Goals Progress</Card.Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="current" name="Current Amount" fill="#8884d8" />
                      <Bar dataKey="projected" name="Projected Amount" fill="#82ca9d" />
                      <Bar dataKey="target" name="Target Amount" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
  <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Goals List</Card.Title>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Goal</th>
                        <th>Target</th>
                        <th>Current</th>
                        <th>Progress</th>
                        <th>Deadline</th>
                        <th>Monthly Contribution</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.map((goal) => {
                        const progressPercent = (goal.collected / goal.target) * 100;
                        const projection = calculateProjection(goal);
                        
                        return (
                          <tr key={goal.id}>
                            <td>
                              <strong>{goal.title}</strong>
                              {goal.description && <div className="text-muted small">{goal.description}</div>}
                            </td>
                            <td>${goal.target.toFixed(2)}</td>
                            <td>${goal.collected.toFixed(2)}</td>
                            <td style={{ width: '15%' }}>
                              <ProgressBar 
                                now={progressPercent} 
                                label={`${progressPercent.toFixed(0)}%`}
                                variant={progressPercent >= 100 ? "success" : "primary"}
                              />
                            </td>
                            <td>{new Date(goal.deadline).toLocaleDateString()}</td>
                            <td>${goal.monthlyContribution?.toFixed(2) || "0.00"}</td>
                            <td>
                              <span className={`badge ${projection.onTrack ? 'bg-success' : 'bg-warning'}`}>
                                {projection.onTrack ? 'On Track' : 'Behind Schedule'}
                              </span>
                            </td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-1"
                                onClick={() => handleEditClick(goal)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => onDeleteGoal(goal.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            <Card.Title>No Goals Yet</Card.Title>
            <Card.Text>
              Start planning your financial future by adding your first goal.
            </Card.Text>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add Your First Goal
            </Button>
          </Card.Body>
        </Card>
      )}
  {/* Add Goal Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Financial Goal</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Goal Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                placeholder="e.g., New Car, Emergency Fund"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Add details about your goal"
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Target Amount ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="target" 
                    value={formData.target} 
                    onChange={handleChange} 
                    required 
                    min="1" 
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Current Amount ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="collected" 
                    value={formData.collected} 
                    onChange={handleChange} 
                    required 
                    min="0" 
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Target Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="deadline" 
                    value={formData.deadline} 
                    onChange={handleChange} 
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Monthly Contribution ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="monthlyContribution" 
                    value={formData.monthlyContribution} 
                    onChange={handleChange} 
                    required 
                    min="0" 
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Goal
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  {/* Edit Goal Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Financial Goal</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Goal Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Target Amount ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="target" 
                    value={formData.target} 
                    onChange={handleChange} 
                    required 
                    min="1" 
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Current Amount ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="collected" 
                    value={formData.collected} 
                    onChange={handleChange} 
                    required 
                    min="0" 
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Target Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="deadline" 
                    value={formData.deadline} 
                    onChange={handleChange} 
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Monthly Contribution ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="monthlyContribution" 
                    value={formData.monthlyContribution} 
                    onChange={handleChange} 
                    required 
                    min="0" 
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
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

export default Goals;