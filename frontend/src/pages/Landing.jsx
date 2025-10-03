import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Landing = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: '✨',
      title: 'Smart Task Management',
      description: 'Organize your tasks with priorities, categories, and due dates. Never miss a deadline again.'
    },
    {
      icon: '🔍',
      title: 'Advanced Search & Filter',
      description: 'Find tasks instantly with powerful search and filtering capabilities.'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your productivity with detailed statistics and completion rates.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is protected with JWT authentication and secure server infrastructure.'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Access your tasks from any device with our mobile-first responsive design.'
    },
    {
      icon: '⚡',
      title: 'Real-time Updates',
      description: 'Changes are saved instantly and synced across all your devices.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="hero-title fade-in">
                Master Your Tasks, <br />
                <span className="text-gradient">Achieve Your Goals</span>
              </h1>
              <p className="hero-subtitle fade-in">
                A powerful, secure, and scalable task management application 
                built with modern web technologies. Organize, track, and complete 
                your tasks with ease.
              </p>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <LinkContainer to="/register">
                  <Button 
                    variant="light" 
                    size="lg" 
                    className="fw-bold px-4 py-3"
                  >
                    Get Started Free
                  </Button>
                </LinkContainer>
                <LinkContainer to="/login">
                  <Button 
                    variant="outline-light" 
                    size="lg" 
                    className="fw-bold px-4 py-3"
                  >
                    Sign In
                  </Button>
                </LinkContainer>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="display-5 fw-bold mb-3">
                Everything You Need to Stay Productive
              </h2>
              <p className="lead text-muted">
                Built with React, Node.js, and modern security practices. 
                A full-stack solution designed for scalability and performance.
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={6} lg={4} key={index}>
                <Card className="h-100 border-0 shadow-sm hover-lift">
                  <Card.Body className="text-center p-4">
                    <div 
                      className="feature-icon mb-3"
                      style={{ fontSize: '3rem' }}
                    >
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Tech Stack Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="display-6 fw-bold mb-4">
                Built with Modern Technologies
              </h2>
              <div className="d-flex justify-content-center flex-wrap gap-4">
                <span className="badge bg-primary p-2 fs-6">React.js</span>
                <span className="badge bg-success p-2 fs-6">Node.js</span>
                <span className="badge bg-warning text-dark p-2 fs-6">Express</span>
                <span className="badge bg-info p-2 fs-6">MongoDB</span>
                <span className="badge bg-secondary p-2 fs-6">JWT Auth</span>
                <span className="badge bg-danger p-2 fs-6">Bootstrap</span>
                <span className="badge bg-dark p-2 fs-6">Vite</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container>
          <Row className="justify-content-center text-center text-white">
            <Col lg={6}>
              <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
              <p className="mb-4">
                Join thousands of users who are already managing their tasks more efficiently.
              </p>
              <LinkContainer to="/register">
                <Button 
                  variant="light" 
                  size="lg" 
                  className="fw-bold px-4 py-3"
                >
                  Create Your Account
                </Button>
              </LinkContainer>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Landing;