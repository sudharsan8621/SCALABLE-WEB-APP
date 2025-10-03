import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  message = 'Loading...',
  variant = 'primary' 
}) => {
  const spinnerSize = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' },
  };

  const SpinnerComponent = () => (
    <div className="text-center">
      <Spinner 
        animation="border" 
        role="status"
        variant={variant}
        style={spinnerSize[size]}
        className="mb-2"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && (
        <div className="text-muted small">
          {message}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <Container fluid className="loading-container">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs="auto">
            <SpinnerComponent />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="loading-container">
      <SpinnerComponent />
    </div>
  );
};

export default LoadingSpinner;