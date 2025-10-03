import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

// Validation schema for profile update
const profileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be more than 50 characters')
    .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
  avatar: yup
    .string()
    .url('Avatar must be a valid URL')
    .nullable(),
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    }
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const response = await userService.updateProfile(data);

      if (response.success) {
        // Update user in context
        updateUser(response.data.user);
        
        setSuccess('Profile updated successfully!');
        toast.success('Profile updated successfully!');
      } else {
        setError(response.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await userService.deactivateAccount();

      if (response.success) {
        toast.success('Account deactivated successfully');
        // Force logout after deactivation
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Account deactivation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to deactivate account.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">👤 Profile Settings</h2>
          <p className="text-muted mb-0">
            Manage your account information and preferences
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Profile Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">📝 Profile Information</h5>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-3">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        {...register('name')}
                        isInvalid={!!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Avatar URL (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    {...register('avatar')}
                    isInvalid={!!errors.avatar}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.avatar?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Provide a URL to your profile picture
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={() => reset({
                      name: user?.name || '',
                      avatar: user?.avatar || '',
                    })}
                    disabled={isSubmitting || loading}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Account Security */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">🔒 Account Security</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Password</h6>
                <p className="text-muted mb-2">
                  Keep your account secure with a strong password.
                </p>
                <Button variant="outline-primary" size="sm">
                  Change Password
                </Button>
              </div>

              <hr />

              <div>
                <h6 className="text-danger">Danger Zone</h6>
                <p className="text-muted mb-2">
                  Deactivating your account will disable access and hide your profile.
                  This action cannot be undone.
                </p>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDeactivateAccount}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Deactivate Account'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Profile Preview */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">👀 Profile Preview</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div
                  className={`rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold ${
                    user?.avatar ? 'd-none' : ''
                  }`}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    fontSize: '2rem',
                    margin: user?.avatar ? 'none' : '0 auto'
                  }}
                >
                  {getInitials(user?.name)}
                </div>
              </div>

              <h5 className="mb-1">{user?.name || 'User Name'}</h5>
              <p className="text-muted mb-2">{user?.email}</p>
              
              <div className="d-flex justify-content-center gap-2">
                <span className={`badge ${user?.isActive ? 'bg-success' : 'bg-secondary'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="badge bg-info">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Account Information */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">ℹ️ Account Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Account Created</small>
                <span className="fw-medium">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Last Login</small>
                <span className="fw-medium">
                  {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Last Updated</small>
                <span className="fw-medium">
                  {user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
                </span>
              </div>

              <div>
                <small className="text-muted d-block">Account ID</small>
                <span className="fw-medium text-break small">
                  {user?._id || 'N/A'}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;