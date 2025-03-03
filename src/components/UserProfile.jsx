import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const UserProfile = ({ user, onUpdateProfile, onLogout }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currency: user.currency || 'USD'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update user profile
    const updatedUser = {
      ...user,
      ...formData
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Call the update callback
    onUpdateProfile(updatedUser);
    
    setIsEditing(false);
    setMessage({ text: 'Profile updated successfully!', type: 'success' });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Account Settings</h2>
      
      {message.text && (
        <Alert variant={message.type}>
          {message.text}
        </Alert>
      )}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Profile Information</Card.Title>
              
              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Currency</Form.Label>
                    <Form.Select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="secondary" 
                      className="me-2"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Preferred Currency:</strong> {user.currency || 'USD'}</p>
                  <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Account Actions</Card.Title>
              <p>Manage your account settings and preferences.</p>
              
              <Button 
                variant="outline-primary" 
                className="w-100 mb-3"
                onClick={() => {
                  // Export data functionality would go here
                  alert('Data export functionality would be implemented here.');
                }}
              >
                Export Your Data
              </Button>
              
              <Button 
                variant="outline-danger" 
                className="w-100"
                onClick={onLogout}
              >
                Logout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;